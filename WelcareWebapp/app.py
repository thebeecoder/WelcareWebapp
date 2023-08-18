import os
import traceback
from datetime import datetime, timedelta

import mysql.connector
from flask import Flask, render_template, request, redirect, url_for, session
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)

app.secret_key = 'welcare'

# Establish the database connection
db_connection = mysql.connector.connect(
    host='127.0.0.1',
    user='root',
    password='root',
    database='welcare_app'
)


@app.route('/', methods=['GET', 'POST'])
def role_select():
    return render_template('role_select.html')


@app.route('/login/', methods=['GET', 'POST'])
def login():
    message = None
    user = None

    type_param = request.args.get('type')

    if request.method == 'POST':
        identifier = request.form['identifier']
        password = request.form['password']

        with db_connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM users WHERE email=%s AND role=%s AND password=%s",
                (identifier, type_param, password)
            )
            user_data = cursor.fetchone()

            if user_data:
                session['user_id'] = user_data[0]
                user = {
                    'first_name': user_data[2],
                    'last_name': user_data[3],
                    'profile_picture': user_data[6]
                }
                role = user_data[5]

                if role == 'Admin':
                    return render_template('admin_dashboard.html', user=user)
                elif role == 'Staff':
                    return render_template('staff_dashboard.html', user=user)
                elif role == 'User':
                    return render_template('user_dashboard.html', user=user)
            else:
                message = "Wrong Email, Password, or Role."

    return render_template('login.html', message=message, user=user, type=type_param)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    message = None

    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        password = request.form['password']
        role = request.form['role']

        # Using context manager for cursor
        with db_connection.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE username=%s OR email=%s", (username, email))
            existing_users = cursor.fetchall()

            if any(user[1] == username and user[2] == email for user in existing_users):
                message = "User exists."
            else:
                # Insert new user into the database
                cursor.execute(
                    "INSERT INTO users (username, email, first_name, last_name, password, role) VALUES (%s, %s, %s, %s, %s, %s)",
                    (username, email, first_name, last_name, password, role))
                db_connection.commit()
                message = "Successfully registered!"

    return render_template('signup.html', message=message)


@app.route('/admin_dashboard')
def admin_dashboard():
    return render_template('admin_dashboard.html')


@app.route('/staff_dashboard')
def staff_dashboard():
    return render_template('staff_dashboard.html')


def get_user_id_from_session():
    return session.get('user_id')


@app.route('/user_dashboard')
def user_dashboard():
    user_id = get_user_id_from_session()

    if user_id:
        with db_connection.cursor() as cursor:
            cursor.execute("SELECT first_name, last_name, profile_picture FROM users WHERE user_id = %s", (user_id,))
            user_info = cursor.fetchone()

        if user_info:
            user = {
                'first_name': user_info[0],
                'last_name': user_info[1],
                'profile_picture': user_info[2]
            }
        else:
            user = {
                'first_name': 'User',
                'last_name': '',
                'profile_picture': 'default_profile_picture.png'
            }

        return render_template('user_dashboard.html', user=user)
    else:
        return redirect(url_for('login'))  # Redirect to login if user ID not found in session


@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))  # Redirect to login if not logged in

    user_id = session['user_id']

    with db_connection.cursor() as cursor:
        cursor.execute(
            "SELECT username, first_name, last_name, profile_picture, email, password FROM users WHERE user_id = %s",
            (user_id,))
        user_info = cursor.fetchone()

    if user_info:
        user = {
            'username': user_info[0],
            'first_name': user_info[1],
            'last_name': user_info[2],
            'profile_picture': user_info[3],
            'email': user_info[4],
            'password': user_info[5],
            'user_id': user_id
        }
    else:
        user = {
            'username': 'User',
            'first_name': '',
            'last_name': '',
            'profile_picture': 'default_profile_picture.png',
            'email': '',
            'password': '',
            'user_id': user_id
        }

    if request.method == 'POST':
        new_profile_picture = request.form['profile_picture']
        new_email = request.form['email']
        new_first_name = request.form['first_name']
        new_last_name = request.form['last_name']
        new_password = request.form['password']

        with db_connection.cursor() as cursor:
            cursor.execute(
                "UPDATE users SET email=%s, password=%s, first_name=%s, last_name=%s WHERE user_id=%s",
                (new_email, new_password, new_first_name, new_last_name, user_id)
            )
            db_connection.commit()

        if new_profile_picture:
            with db_connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE users SET profile_picture=%s WHERE user_id=%s",
                    (new_profile_picture, user_id)
                )
                db_connection.commit()
            user['profile_picture'] = new_profile_picture

    return render_template('profile.html', user=user)


@app.route('/update_profile', methods=['POST'])
def update_profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    user_id = session['user_id']

    new_email = request.form['email']
    new_first_name = request.form['first_name']
    new_last_name = request.form['last_name']
    new_password = request.form['password']

    # Check if a new profile picture was uploaded
    if 'profile_picture' in request.files:
        profile_picture = request.files['profile_picture']
        if profile_picture.filename != '':
            # Generate a unique filename for the uploaded picture
            filename = secure_filename(profile_picture.filename)
            new_picture_filename = f"user_{user_id}_{filename}"

            # Save the uploaded picture to the static folder
            new_picture_path = os.path.join(app.static_folder, new_picture_filename)
            profile_picture.save(new_picture_path)

            # Update the profile_picture value in the database
            with db_connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE users SET profile_picture=%s WHERE user_id=%s",
                    (new_picture_filename, user_id)
                )
                db_connection.commit()

    # Update the user's profile information in the database
    with db_connection.cursor() as cursor:
        cursor.execute(
            "UPDATE users SET email=%s, password=%s, first_name=%s, last_name=%s WHERE user_id=%s",
            (new_email, new_password, new_first_name, new_last_name, user_id)
        )
        db_connection.commit()

    return redirect(url_for('profile'))


@app.route('/diary', methods=['GET'])
def diary():
    user_id = get_user_id_from_session()

    if user_id:
        # Assuming you have already defined the db_connection variable earlier in your code
        with db_connection.cursor() as cursor:
            cursor.execute("SELECT first_name, last_name, profile_picture FROM users WHERE user_id = %s", (user_id,))
            user_info = cursor.fetchone()

        if user_info:
            user = {
                'first_name': user_info[0],
                'last_name': user_info[1],
                'profile_picture': user_info[2]
            }
        else:
            user = {
                'first_name': 'User',
                'last_name': '',
                'profile_picture': 'default_profile_picture.png'
            }
    else:
        return redirect(url_for('login'))

    # Calculate the date 7 days ago from today
    seven_days_ago = datetime.now() - timedelta(days=7)

    try:
        with db_connection.cursor() as cursor:
            cursor.execute(
                "SELECT attended_datetime FROM diary_records WHERE user_id = %s AND attended_datetime >= %s ORDER BY attended_datetime DESC",
                (user_id, seven_days_ago)
            )
            diary_records_tuples = cursor.fetchall()

        diary_records = [{'attended_datetime': record[0]} for record in diary_records_tuples]

        return render_template('diary.html', user=user, diary_records=diary_records)
    except Exception as e:
        traceback.print_exc()
        return "An error occurred"


@app.route('/logout')
def logout():
    session.pop('user_id', None)  # Remove user_id from the session
    return redirect(url_for('login'))  # Redirect to login page


if __name__ == "__main__":
    app.run()
