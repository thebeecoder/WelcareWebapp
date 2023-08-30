import logging
import os
import mysql.connector
import mysql.connector.pooling
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
from flask_session import Session

app = Flask(__name__)

app.secret_key = 'welcare'
UPLOAD_FOLDER = os.path.join('static', 'media')  # Set the path to static/media
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mkv'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Establish the database connection
# db_connection = mysql.connector.connect(
#     host='welcare.org.uk',
#     user='welcare',
#     password='welcarewebapp',
#     database='welcarewebapp'
# )

db_config = {
    "host": "welcare.org.uk",
    "user": "welcare",
    "password": "welcarewebapp",
    "database": "welcarewebapp",
    "pool_name": "my_pool",
    "pool_size": 5,
    "pool_reset_session": False
}
connection_pool = mysql.connector.pooling.MySQLConnectionPool(**db_config)
db_connection = connection_pool.get_connection()

app.config['SESSION_TYPE'] = 'filesystem'
Session(app)


@app.before_request
def cleanup():
    session.modified = True


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

        try:
            with db_connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM users WHERE email=%s AND role=%s AND password=%s",
                    (identifier, type_param, password)
                )
                user_data = cursor.fetchone()

                if user_data:
                    user = {
                        'first_name': user_data[2],
                        'last_name': user_data[3],
                        'profile_picture': user_data[6]
                    }
                    session['user_id'] = user_data[0]
                    role = user_data[5]

                    if role == 'Admin':
                        return render_template('admin_dashboard.html', user=user)
                    elif role == 'Staff':
                        return render_template('staff_dashboard.html', user=user)
                    elif role == 'User':
                        return render_template('user_dashboard.html', user=user)
                else:
                    message = "Wrong Email, Password, or Role."
        except Exception as e:
            print("An error occurred:", e)

    return render_template('login.html', message=message, user=user, type=type_param)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    message = None

    if request.method == 'POST':
        email = request.form['email']
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        password = request.form['password']
        role = "User"

        # Using context manager for cursor
        with db_connection.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
            existing_users = cursor.fetchall()

            if any(user[1] == email for user in existing_users):
                message = "User already exists."
            else:
                # Insert new user into the database
                cursor.execute(
                    "INSERT INTO users (email, first_name, last_name, password, role) VALUES (%s, %s, %s, %s, %s)",
                    (email, first_name, last_name, password, role))
                db_connection.commit()
                message = "Successfully registered!"

    return render_template('signup.html', message=message)


@app.route('/admin_dashboard')
def admin_dashboard():
    return render_template('admin_dashboard.html')


@app.route('/staff_dashboard')
def staff_dashboard():
    return render_template('staff_dashboard.html')


@app.route('/user_dashboard')
def user_dashboard():
    user_id = session.get('user_id')

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

@app.route('/getrecords', methods=['GET'])
def get_records():
    user_id = session.get('user_id')

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if user_id:
        with db_connection.cursor() as cursor:
            cursor.execute(
                "SELECT attended_datetime FROM diary_records WHERE user_id = %s AND attended_datetime >= %s AND attended_datetime <= %s",
                (user_id, start_date, end_date))
            diary_records = cursor.fetchall()

        return jsonify(diary_records=diary_records)
    else:
        return jsonify(message="User not logged in"), 401
@app.route('/diary', methods=['GET'])
def get_diary_records():
    user_id = session.get('user_id')

    if user_id:
        with db_connection.cursor() as cursor:
            cursor.execute("SELECT first_name, last_name, profile_picture FROM users WHERE user_id = %s", (user_id,))
            user_info = cursor.fetchone()
            cursor.execute(
                "SELECT attended_datetime FROM diary_records WHERE user_id = %s AND attended_datetime >= %s AND attended_datetime <= %s",
                (user_id, start_date, end_date))
            diary_records = cursor.fetchall()

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

        return render_template('diary.html', user=user)
    else:
        return jsonify(message="User not logged in"), 401


@app.route('/notes')
def view_notes():
    user_id = session.get('user_id')

    if user_id:
        with db_connection.cursor() as cursor:
            # Fetch user information
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

            # Fetch notes for the user
            cursor.execute("SELECT note_date, content FROM notes WHERE user_id = %s", (user_id,))
            user_notes = cursor.fetchall()

            return render_template('notes.html', user=user, user_notes=user_notes)
    else:
        return redirect(url_for('login'))


@app.route('/media', methods=['GET', 'POST'])
def view_media():
    user_id = session.get('user_id')

    if user_id:
        # Fetch user information
        cursor = db_connection.cursor()
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
        if request.method == 'POST':
            file = request.files['file']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                upload_datetime = datetime.now()

                cursor = db_connection.cursor()
                cursor.execute(
                    "INSERT INTO media (user_id, media_type, media_data, upload_datetime) VALUES (%s, %s, %s, %s)",
                    (user_id, filename, upload_datetime))
                db_connection.commit()

                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                flash('File uploaded successfully', 'success')
                return redirect(url_for('view_media'))

        cursor = db_connection.cursor()
        cursor.execute("SELECT media_id, media_type, media_data, upload_datetime FROM media WHERE user_id = %s",
                       (user_id,))
        user_media = cursor.fetchall()

        return render_template('media.html', user=user, user_media=user_media)
    else:
        return redirect(url_for('login'))


@app.route('/delete/<int:media_id>', methods=['POST'])
def delete_media(media_id):
    user_id = session.get('user_id')

    if user_id:
        cursor = db_connection.cursor()
        cursor.execute("SELECT media_data FROM media WHERE media_id = %s AND user_id = %s", (media_id, user_id))
        media_data = cursor.fetchone()

        if media_data:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], media_data[0])
            os.remove(file_path)
            cursor.execute("DELETE FROM media WHERE media_id = %s", (media_id,))
            db_connection.commit()
            flash('File deleted successfully', 'success')

    return redirect(url_for('view_media'))


@app.route('/logout')
def logout():
    session.pop('user_id', None)  # Remove user_id from the session
    return redirect(url_for('role_select'))  # Redirect to login page


if __name__ == "__main__":
    app.debug = True
    app.run()
