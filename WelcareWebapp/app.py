import logging
import os
import mysql.connector
import mysql.connector.pooling
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
from flask_session import Session
import cv2
import os
import base64
from datetime import datetime
from werkzeug.utils import secure_filename
import os
import uuid

app = Flask(__name__)

app.secret_key = 'welcare'
UPLOAD_FOLDER = os.path.join('static', 'media')  # Set the path to static/media


app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Establish the database connection
# db_connection = mysql.connector.connect(
#     host='srv743.hstgr.io',
#     user='u159785945_welcare',
#     password='Welcarewebapp12',
#     database='u159785945_welcarewebapp'
# )

db_config = {
    "host": "srv743.hstgr.io",
    "user": "u159785945_welcare",
    "password": "Welcarewebapp12",
    "database": "u159785945_welcarewebapp",
    "pool_name": "my_pool",
    "pool_size": 32,
    "pool_reset_session": False,
}
connection_pool = mysql.connector.pooling.MySQLConnectionPool(**db_config)
db_connection = connection_pool.get_connection()

app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

def get_db_connection():
    try:
        db_connection = connection_pool.get_connection()
        return db_connection
    except Exception as e:
        print("An error occurred while getting a database connection:", e)
        return None

@app.before_request
def cleanup():
    session.modified = True


def fetch_user_info(cursor, user_id):
    try:
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

        return user
    except Exception as e:
        print("An error occurred while fetching user info:", e)
        return None

@app.route('/', methods=['GET', 'POST'])
def role_select():
    return render_template('role_select.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    message = None

    if request.method == 'POST':
        email = request.form['email']
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        password = request.form['password']
        role = "User"

        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                cursor = db_connection.cursor()

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

        except Exception as e:
            print("An error occurred:", e)

        # No need to explicitly close the cursor as it's handled by get_db_connection

    return render_template('signup.html', message=message)

@app.route('/login/', methods=['GET', 'POST'])
def login():
    message = None
    user = None

    type_param = request.args.get('type')

    if request.method == 'POST':
        identifier = request.form['identifier']
        password = request.form['password']

        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection, db_connection.cursor() as cursor:
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

@app.route('/user_dashboard')
def user_dashboard():
    user_id = session.get('user_id')

    if not user_id:
        return redirect(url_for('login'))

    try:
        # Get a database connection from the pool using the get_db_connection function
        with get_db_connection() as db_connection:
            if not db_connection:
                return "Database connection error: Unable to obtain a connection", 500

            # Successfully obtained a connection, proceed with database operations
            with db_connection.cursor() as cursor:
                user = fetch_user_info(cursor, user_id)
            return render_template('user_dashboard.html', user=user)

    except Exception as e:
        # Handle any other exceptions that may occur
        print("An error occurred:", e)
        return "An error occurred while processing your request", 500


@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))  # Redirect to login if not logged in

    user_id = session['user_id']

    user = {
        'first_name': '',
        'last_name': '',
        'profile_picture': 'default_profile_picture.png',
        'email': '',
        'password': '',
        'role': '',
        'user_id': user_id
    }

    try:
        # Use get_db_connection to obtain a database connection
        with get_db_connection() as db_connection:
            cursor = db_connection.cursor()
            user = fetch_user_info(cursor, user_id)
            cursor.execute(
                "SELECT first_name, last_name, profile_picture, email, role, password FROM users WHERE user_id = %s",
                (user_id,))
            user_info = cursor.fetchone()

            if user_info:
                user = {
                    'first_name': user_info[0],
                    'last_name': user_info[1],
                    'profile_picture': user_info[2],
                    'email': user_info[3],
                    'role': user_info[4],
                    'password': user_info[5],
                    'user_id': user_id
                }

            if request.method == 'POST':
                new_email = request.form['email']
                new_first_name = request.form['first_name']
                new_last_name = request.form['last_name']
                new_password = request.form['password']

                # Update user information in the database
                cursor.execute(
                    "UPDATE users SET email=%s, password=%s, first_name=%s, last_name=%s WHERE user_id=%s",
                    (new_email, new_password, new_first_name, new_last_name, user_id)
                )
                db_connection.commit()

                flash("Profile Updated Successfully!", "success")

    except Exception as e:
        print("An error occurred:", e)
        flash("An error occurred while updating the profile.", "error")

    return render_template('profile.html', user=user)

@app.route('/editUserProfile', methods=['POST'])
def edit_user_profile():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Get user details from the form
            email = request.form.get('email')
            first_name = request.form.get('first_name')
            last_name = request.form.get('last_name')
            password = request.form.get('password')
            role = request.form.get('role')

            # Handle file upload for the profile picture
            profile_picture = request.files['profile_picture']
            if profile_picture:
                # Save the file to the static/images folder with its original filename
                profile_picture.save(os.path.join('static/images', secure_filename(profile_picture.filename)))
                # Set the profile picture filename in the database
                profile_picture_filename = secure_filename(profile_picture.filename)
            else:
                # Fetch the user's current profile information from the database
                with get_db_connection() as db_connection:
                    with db_connection.cursor() as cursor:
                        cursor.execute("SELECT profile_picture FROM users WHERE user_id = %s", (user_id,))
                        result = cursor.fetchone()
                        if result:
                            profile_picture_filename = result[0]
                        else:
                            # Handle the case where the user does not exist
                            return jsonify(message="User not found"), 404

            # Define and obtain the database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    # Update the user's details in the database
                    cursor.execute(
                        "UPDATE users SET email = %s, first_name = %s, last_name = %s, password = %s, role = %s, profile_picture = %s WHERE user_id = %s",
                        (email, first_name, last_name, password, role, profile_picture_filename, user_id)
                    )
                    # Commit the transaction
                    db_connection.commit()

                    flash("Profile Updated Successfully!", "Profile Updated Successfully!")

        except Exception as e:
            # Handle exceptions, log errors, or return appropriate error responses
            print("An error occurred:", e)

            # Rollback the transaction if an error occurred
            if db_connection.is_connected():
                db_connection.rollback()

        # You can return a response or redirect to a profile page after updating
        return redirect(url_for('profile'))
    else:
        return jsonify(message="User not logged in"), 401


@app.route('/diary', methods=['GET'])
def get_diary_records():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    user = fetch_user_info(cursor, user_id)

            return render_template('diary.html', user=user)

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while fetching user information"), 500

    return jsonify(message="User not logged in"), 401


@app.route('/getrecords', methods=['GET'])
def get_records():
    user_id = session.get('user_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT attended_datetime FROM diary_records WHERE user_id = %s AND attended_datetime >= %s AND attended_datetime <= %s",
                        (user_id, start_date, end_date))
                    diary_records = cursor.fetchall()

            return jsonify(diary_records=diary_records)

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while fetching diary records"), 500

    return jsonify(message="User not logged in"), 401


@app.route('/notes')
def view_notes():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    user = fetch_user_info(cursor, user_id)

            return render_template('notes.html', user=user)
        except Exception as e:
            print("An error occurred:", e)

    return redirect(url_for('login'))


@app.route('/getnotes')
def get_notes():
    user_id = session.get('user_id')

    if user_id:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    # Fetch notes for the user
                    cursor.execute("SELECT note_date, Title, content, note_id FROM notes WHERE user_id = %s AND note_date BETWEEN %s AND %s", (user_id, start_date, end_date))
                    user_notes = cursor.fetchall()

                    # Convert notes to a list of dictionaries for JSON response
                    notes_list = []
                    for note in user_notes:
                        note_dict = {
                            'note_date': note[0],
                            'title': note[1],
                            'content': note[2],
                            'note_id': note[3]
                        }
                        notes_list.append(note_dict)

                    # Create a JSON response
                    response = {'notes': notes_list}
                    return jsonify(response)

        except Exception as e:
            print("An error occurred:", e)

    return jsonify({'error': 'User not authenticated'}), 401  # Unauthorized status code


@app.route('/media', methods=['GET', 'POST'])
def view_media():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    user = fetch_user_info(cursor, user_id)

                    # Fetch user media
                    cursor.execute("SELECT * FROM media WHERE user_id = %s", (user_id,))
                    user_media = cursor.fetchall()

            return render_template('media.html', user=user, user_media=user_media)

        except Exception as e:
            print("An error occurred:", e)
            return render_template('error.html', error_message="An error occurred while fetching media")

    else:
        return redirect(url_for('login'))


@app.route('/getmediaforadmin', methods=['GET'])
def get_mediaAdmin():
    user_id = session.get('user_id')

    if user_id:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        try:
            with db_connection.cursor() as cursor:
                cursor.execute("SELECT media_id, mediatitle, media_type, upload_datetime, media_data FROM media WHERE user_id = %s AND upload_datetime BETWEEN %s AND %s", (user_id, start_date, end_date))
                user_media = cursor.fetchall()

            # Convert media records to a list of dictionaries
            media_list = []
            for media in user_media:
                media_dict = {
                    'media_id': media[0],
                    'mediatitle': media[1],
                    'media_type': media[2],
                    'upload_datetime': media[3].strftime('%Y-%m-%d %H:%M:%S'),
                    'media_data': media[4]
                }
                # Generate video thumbnails and convert to base64
                if media_dict['media_type'].startswith('video'):
                    video_path = os.path.join('static/media', media_dict['media_data'])
                    thumbnail_base64 = generate_video_thumbnail(video_path)
                    media_dict['thumbnail_base64'] = thumbnail_base64

                media_list.append(media_dict)

            # Return a JSON response with media records
            return jsonify({'media': media_list})
        except Exception as e:
            print("An error occurred:", e)
            return jsonify({'error': 'An error occurred'}), 500  # Internal Server Error
    else:
        return jsonify({'error': 'User not authenticated'}), 401  # Unauthorized status code


def generate_video_thumbnail(video_path):
    try:
        # Capture the video using OpenCV
        cap = cv2.VideoCapture(video_path)

        # Read the first frame
        ret, frame = cap.read()

        # Check if the frame was read successfully
        if ret:
            # Resize the frame to your desired thumbnail size
            thumbnail_size = (200, 200)  # Adjust the size as needed
            frame = cv2.resize(frame, thumbnail_size)

            # Convert the frame to base64
            _, buffer = cv2.imencode('.jpg', frame)
            thumbnail_base64 = base64.b64encode(buffer).decode()

            # Release the video capture
            cap.release()

            return thumbnail_base64
        else:
            # Release the video capture and return an empty string if the video couldn't be read
            cap.release()
            return ''
    except Exception as e:
        print("An error occurred while generating video thumbnail:", e)
        return ''

@app.route('/insertmedia', methods=['POST'])
def insert_media():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    user = fetch_user_info(cursor, user_id)

                    if request.method == 'POST':
                        file = request.files['file']
                        if file and allowed_file(file.filename):
                            try:
                                filename = secure_filename(file.filename)
                                upload_datetime = datetime.now()

                                # Check if the filename already exists and generate a unique name if needed
                                original_filename = filename
                                counter = 1
                                while os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], filename)):
                                    filename = f"{os.path.splitext(original_filename)[0]}_{counter}{os.path.splitext(original_filename)[1]}"
                                    counter += 1

                                cursor.execute(
                                    "INSERT INTO media (user_id, media_type, mediatitle, media_data, upload_datetime) VALUES (%s, %s, %s, %s, %s)",
                                    (user_id, filename, upload_datetime))
                                db_connection.commit()

                                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                                flash('File uploaded successfully', 'success')
                                return jsonify({'message': 'File uploaded successfully'})
                            except Exception as e:
                                flash('File upload failed', 'danger')
                                print("An error occurred:", e)
                                return jsonify({'error': 'File upload failed'})

            return jsonify({'error': 'Invalid request'}), 400  # Bad request status code

        except Exception as e:
            print("An error occurred:", e)
            return jsonify({'error': 'An error occurred while handling the request'}), 500  # Internal server error

    else:
        return jsonify({'error': 'User not authenticated'}), 401  # Unauthorized status code

@app.route('/deletemedia', methods=['POST'])
def delete_media():
    user_id = session.get('user_id')

    if user_id:
        media_id = request.form.get('media_id')  # You can pass the media_id as a POST parameter

        if media_id:
            try:
                # Use get_db_connection to obtain a database connection
                with get_db_connection() as db_connection:
                    with db_connection.cursor() as cursor:
                        # First, fetch the media record to get the file name
                        cursor.execute("SELECT media_data FROM media WHERE media_id = %s AND user_id = %s", (media_id, user_id))
                        media_data = cursor.fetchone()

                        if media_data:
                            filename = media_data[0]

                            # Delete the record from the database
                            cursor.execute("DELETE FROM media WHERE media_id = %s AND user_id = %s", (media_id, user_id))
                            db_connection.commit()

                            # Delete the associated file from your server's storage
                            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                            if os.path.exists(file_path):
                                os.remove(file_path)

                            return jsonify({'message': 'Media deleted successfully'}, 200)
                        else:
                            return jsonify({'error': 'Media not found'}, 404)

            except Exception as e:
                return jsonify({'error': 'Failed to delete media'}, 500)

        else:
            return jsonify({'error': 'Media ID not provided'}, 400)

    else:
        return jsonify({'error': 'User not authenticated'}, 401)


@app.route('/attendance', methods=['GET'])
def view_attendance():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    user = fetch_user_info(cursor, user_id)

            return render_template('attendance.html', user=user)

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while fetching user information"), 500

    return jsonify(message="User not logged in"), 401


@app.route('/recordset', methods=['GET'])
def get_attendance_records():
    user_id = session.get('user_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    print("User ID:", user_id)
    print("Start Date:", start_date)
    print("End Date:", end_date)

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT attendance_id, attendance_datetime, videotitle, media_path FROM welcare_attendance WHERE user_id = %s AND attendance_datetime BETWEEN %s AND %s",
                        (user_id, start_date, end_date)
                    )
                    attendance_records = cursor.fetchall()
                    print("Attendance Records:", attendance_records)

                    video_data = []
                    common_thumbnail_width = 200  # Set the common width for all thumbnails
                    common_thumbnail_height = 150  # Set the common height for all thumbnails

                    for record in attendance_records:
                        video_path = os.path.join(app.static_folder, 'attendance', record[3])
                        cap = cv2.VideoCapture(video_path)
                        ret, frame = cap.read()

                        if ret:
                            original_height, original_width, _ = frame.shape
                            aspect_ratio = original_width / original_height

                            # Calculate the new width and height based on the common_thumbnail_width and aspect_ratio
                            if aspect_ratio > 1:
                                new_width = common_thumbnail_width
                                new_height = int(common_thumbnail_width / aspect_ratio)
                            else:
                                new_height = common_thumbnail_height
                                new_width = int(common_thumbnail_height * aspect_ratio)

                            # Resize the frame to the new dimensions
                            thumbnail = cv2.resize(frame, (new_width, new_height))

                            # Calculate black borders if needed
                            border_top = (common_thumbnail_height - new_height) // 2
                            border_bottom = common_thumbnail_height - new_height - border_top
                            border_left = (common_thumbnail_width - new_width) // 2
                            border_right = common_thumbnail_width - new_width - border_left
                            thumbnail = cv2.copyMakeBorder(thumbnail, border_top, border_bottom, border_left,
                                                           border_right,
                                                           cv2.BORDER_CONSTANT, value=[0, 0, 0])

                            ret, thumbnail_data = cv2.imencode('.jpg', thumbnail, [int(cv2.IMWRITE_JPEG_QUALITY), 400])
                            if ret:
                                thumbnail_base64 = base64.b64encode(thumbnail_data).decode('utf-8')
                                video_url = url_for('static', filename='attendance/' + record[3])
                                video_data.append({
                                    'thumbnail_data': thumbnail_base64,
                                    'video_url': video_url,
                                    'attendance_datetime': record[1],
                                    'videotitle': record[2],
                                })
                        cap.release()

            return jsonify({'attendance_records': attendance_records, 'video_data': video_data})

        except Exception as e:
            print("An error occurred:", e)

    return jsonify(message="User not logged in"), 401


@app.route('/admin_dashboard')
def admin_dashboard():
    user_id = session.get('user_id')

    if not user_id:
        return redirect(url_for('login'))

    try:
        # Get a database connection from the pool using the get_db_connection function
        with get_db_connection() as db_connection:
            if not db_connection:
                return "Database connection error: Unable to obtain a connection", 500

            # Successfully obtained a connection, proceed with database operations
            with db_connection.cursor() as cursor:
                user = fetch_user_info(cursor, user_id)
            return render_template('admin_dashboard.html', user=user)

    except Exception as e:
        # Handle any other exceptions that may occur
        print("An error occurred:", e)
        return "An error occurred while processing your request", 500


@app.route('/manage_users')
def manage_users():
    user_id = session.get('user_id')

    if user_id:
        try:
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    user = fetch_user_info(cursor, user_id)

            return render_template('manage_users.html', user=user)
        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while fetching user information"), 500
    else:
        return redirect(url_for('login'))  # Redirect to login if user ID not found in session


@app.route('/getUserDetails', methods=['GET'])
def get_user_details():
    user_id = session.get('user_id')

    if user_id:
        try:
            requested_user_id = request.args.get('userID')
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    cursor.execute("SELECT * FROM users WHERE user_id = %s", (requested_user_id,))
                    user_details = cursor.fetchall()
                    return jsonify(user_details=user_details)

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while fetching user details"), 500

    else:
        return jsonify(message="User not logged in"), 401


@app.route('/createProfile', methods=['POST'])
def create_profile():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Get user details from the request
            email = request.form.get('email')
            first_name = request.form.get('first_name')
            last_name = request.form.get('last_name')
            password = request.form.get('password')
            role = request.form.get('role')
            # Add other user details here as needed

            profile_picture = request.files['profile_picture']
            if profile_picture:
                # Generate a unique filename based on current time and random value
                unique_filename = str(int(datetime.datetime.now().timestamp())) + '_' + str(uuid.uuid4())[:8]
                # Get the file extension from the original filename
                file_extension = os.path.splitext(profile_picture.filename)[1]
                # Combine the unique filename and file extension
                filename = secure_filename(unique_filename + file_extension)
                # Save the file to the static folder
                profile_picture.save(os.path.join('static', 'image', filename))
                # Set the profile picture filename in the database
                profile_picture_filename = filename
            else:
                profile_picture_filename = 'default_profile_picture.jpg'  # Use a default picture if no file is uploaded

            # Define and obtain the database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    # Check if the email already exists in the users table
                    cursor.execute("SELECT COUNT(*) FROM users WHERE email = %s", (email,))
                    existing_user_count = cursor.fetchone()[0]

                    if existing_user_count > 0:
                        # Email already exists, show an error message and redirect
                        flash("User already exists.", "User already exists.")
                        # return redirect(url_for('manage_users'))
                        return jsonify(message="User already exists.")

                    # Insert the user's details into the database
                    cursor.execute(
                        "INSERT INTO users (email, first_name, last_name, password, role, profile_picture) VALUES (%s, %s, %s, %s, %s, %s)",
                        (email, first_name, last_name, password, role, profile_picture_filename)
                    )
                    # Commit the transaction
                    db_connection.commit()

                    flash("New User Added Successfully!", "New User Added Successfully!")

        except Exception as e:
            # Handle exceptions, log errors, or return appropriate error responses
            print("An error occurred:", e)

            # Rollback the transaction if an error occurred
            if db_connection.is_connected():
                db_connection.rollback()

        # You can return a response or JSON data here based on your application's requirements
        return jsonify(message="Success")
        # return redirect(url_for('manage_users'))
    else:
        return jsonify(message="User not logged in"), 401

import  datetime
@app.route('/editProfile', methods=['POST'])
def edit_profile():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Get user details from the form
            email = request.form.get('email')
            first_name = request.form.get('first_name')
            last_name = request.form.get('last_name')
            password = request.form.get('password')
            role = request.form.get('role')
            # Add other user details here as needed

            # Handle file upload for the profile picture
            profile_picture = request.files['profile_picture']
            if profile_picture:
                # Generate a unique filename based on current time and random value
                unique_filename = str(int(datetime.datetime.now().timestamp())) + '_' + str(uuid.uuid4())[:8]
                # Get the file extension from the original filename
                file_extension = os.path.splitext(profile_picture.filename)[1]
                # Combine the unique filename and file extension
                filename = secure_filename(unique_filename + file_extension)
                # Save the file to the static folder
                profile_picture.save(os.path.join('static', 'images', filename))
                # Set the profile picture filename in the database
                profile_picture_filename = filename
            else:
                # Fetch the user's current profile information from the database
                with get_db_connection() as db_connection:
                    with db_connection.cursor() as cursor:
                        cursor.execute("SELECT profile_picture FROM users WHERE user_id = %s", (user_id,))
                        result = cursor.fetchone()
                        if result:
                            profile_picture_filename = result[0]
                        else:
                            # Handle the case where the user does not exist
                            return jsonify(message="User not found"), 404

            # Define and obtain the database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    # Update the user's details in the database
                    cursor.execute(
                        "UPDATE users SET email = %s, first_name = %s, last_name = %s, password = %s, role = %s, profile_picture = %s WHERE user_id = %s",
                        (email, first_name, last_name, password, role, profile_picture_filename, user_id)
                    )
                    # Commit the transaction
                    db_connection.commit()

                    flash("Profile Updated Successfully!", "Profile Updated Successfully!")

        except Exception as e:
            # Handle exceptions, log errors, or return appropriate error responses
            print("An error occurred:", e)

            # Rollback the transaction if an error occurred
            if db_connection.is_connected():
                db_connection.rollback()

        # You can return a response or redirect to a profile page after updating
        return redirect(url_for('manage_users'))
    else:
        return jsonify(message="User not logged in"), 401


@app.route('/deleteUser', methods=['GET'])
def delete_user():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    # Get the user_id to delete
                    user_id_to_delete = int(request.args.get('userID'))  # Convert to integer

                    cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id_to_delete,))

                    # Commit the transaction
                    db_connection.commit()

                    flash("User deleted successfully!", "User deleted successfully!")

            # return redirect(url_for('manage_users'))
            return jsonify(message="Success")

        except Exception as e:
            # Handle exceptions, log errors, or return appropriate error responses
            print("An error occurred:", e)
            return jsonify(message="Failed to delete user"), 500

    else:
        return jsonify(message="User not logged in"), 401


@app.route('/manage_diary', methods=['GET'])
def get_diary_records_for_admin():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    cursor.execute("SELECT email FROM users")
                    user_emails = [row[0] for row in cursor.fetchall()]
                    user = fetch_user_info(cursor, user_id)

            return render_template('manage_diary.html', user_emails=user_emails, user=user)

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while fetching user information"), 500

    return jsonify(message="User not logged in"), 401


@app.route('/getrecordsforadmin', methods=['GET'])
def get_records_for_admin():
    user_id = session.get('user_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT diary_records.record_id, users.first_name, users.last_name, users.email, diary_records.attended_datetime, users.user_id FROM users INNER JOIN diary_records ON users.user_id = diary_records.user_id WHERE attended_datetime >= %s AND attended_datetime <= %s",
                        (start_date, end_date))
                    diary_records = cursor.fetchall()

            return jsonify(diary_records=diary_records)

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while fetching diary records"), 500

    return jsonify(message="User not logged in"), 401


@app.route('/getUsersList', methods=['GET'])
def get_users_list():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    cursor.execute("SELECT * from users;")
                    users_list = cursor.fetchall()

            return jsonify(users_list=users_list)

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while fetching users list."), 500

    return jsonify(message="User not logged in"), 401


@app.route('/addNewDiary', methods=['POST'])
def add_new_diary_record():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Get user details from the request
            user_id = request.form.get('user_id')
            attended_datetime = request.form.get('visit_date')

            # Define and obtain the database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                   cursor.execute(
                       "INSERT INTO diary_records (user_id, attended_datetime) VALUES (%s, %s)",
                        (user_id, attended_datetime))

                db_connection.commit()

        except Exception as e:
            # Handle exceptions, log errors, or return appropriate error responses
            print("An error occurred:", e)
            # Rollback the transaction if an error occurred
            if db_connection.is_connected():
                db_connection.rollback()

        return jsonify(message="Success")
    else:
        return jsonify(message="User not logged in"), 401


@app.route('/updateDiary', methods=['POST'])
def update_diary_entry():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Get the updated parameters from the form
            user_id = request.form.get('user_id')
            record_id = request.form.get('record_id')
            attended_datetime = request.form.get('visit_date')

            # Define and obtain the database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    cursor.execute(
                        "UPDATE diary_records SET attended_datetime = %s, user_id = %s WHERE record_id = %s",
                        (attended_datetime, user_id, record_id)
                    )
                    db_connection.commit()
                    flash("Diary Record Updated Successfully!", "Diary Record Updated Successfully")

        except Exception as e:
            # Handle exceptions, log errors, or return appropriate error responses
            print("An error occurred:", e)

            # Rollback the transaction if an error occurred
            if db_connection.is_connected():
                db_connection.rollback()

            flash("Failed to update diary record. Please try again.", "Error")

        # Redirect to the page where you want to display the result or handle errors
        return jsonify(message="Success")
    else:
        return jsonify(message="User not logged in"), 401


@app.route('/deleteDiary', methods=['GET'])
def delete_diary():
    user_id = session.get('user_id')
    record_id = request.args.get('recordID')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    cursor.execute("DELETE FROM diary_records WHERE record_id= %s", (record_id,))
                    db_connection.commit()

            return jsonify(message="Success")

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while deleting diary record."), 500

    return jsonify(message="User not logged in"), 401


@app.route('/manage_notes', methods=['GET'])
def manage_notes():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    user = fetch_user_info(cursor, user_id)

            return render_template('manage_notes.html', user=user)

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while fetching user information"), 500

    return jsonify(message="User not logged in"), 401

@app.route('/getNotesForAdmin')
def get_notes_for_admin():
    user_id = session.get('user_id')

    if user_id:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    # Fetch notes for the user
                    cursor.execute("SELECT note_date, Title, content, note_id FROM notes WHERE note_date >= %s AND note_date <= %s", (start_date, end_date))
                    user_notes = cursor.fetchall()

                    # Convert notes to a list of dictionaries for JSON response
                    notes_list = []
                    for note in user_notes:
                        note_dict = {
                            'note_date': note[0],
                            'title': note[1],
                            'content': note[2],
                            'note_id': note[3]
                        }
                        notes_list.append(note_dict)

                    # Create a JSON response
                    response = {'notes': notes_list}
                    return jsonify(response)

        except Exception as e:
            print("An error occurred:", e)

    return jsonify({'error': 'User not authenticated'}), 401  # Unauthorized status code


@app.route('/updateNotes', methods=['POST'])
def update_notes_entry():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Get the updated parameters from the form
            user_id = request.form.get('user_id')
            note_id = request.form.get('note_id')
            note_date = request.form.get('note_date')
            title = request.form.get('title')
            content = request.form.get('content')

            # Define and obtain the database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    cursor.execute(
                        "UPDATE notes SET Title = %s, note_date = %s, content = %s, user_id = %s WHERE note_id = %s",
                        (title, note_date, content, user_id, note_id)
                    )
                    db_connection.commit()
                    flash("Note Updated Successfully!", "Note Updated Successfully")

        except Exception as e:
            # Handle exceptions, log errors, or return appropriate error responses
            print("An error occurred:", e)

            # Rollback the transaction if an error occurred
            if db_connection.is_connected():
                db_connection.rollback()

            flash("Failed to update Note. Please try again.", "Error")

        # Redirect to the page where you want to display the result or handle errors
        return jsonify(message="Success")
    else:
        return jsonify(message="User not logged in"), 401


@app.route('/deleteNotes', methods=['GET'])
def delete_notes():
    user_id = session.get('user_id')
    note_id = request.args.get('note_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    cursor.execute("DELETE FROM notes WHERE note_id= %s", (note_id,))
                    db_connection.commit()

            return jsonify(message="Success")

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while deleting note."), 500

    return jsonify(message="User not logged in"), 401



@app.route('/manage_media', methods=['GET'])
def manage_media():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    user = fetch_user_info(cursor, user_id)

            return render_template('manage_media.html', user=user)

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while fetching user information"), 500

    return jsonify(message="User not logged in"), 401


@app.route('/getmedia', methods=['GET'])
def get_media():
    user_id = session.get('user_id')

    if user_id:
        # Check if the user is an admin (you may have a separate check for this)
        is_admin = check_if_user_is_admin(user_id)

        # Only proceed if the user is an admin
        if is_admin:
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')

            try:
                with db_connection.cursor() as cursor:
                    cursor.execute("SELECT media_id, mediatitle, media_type, upload_datetime, media_data FROM media WHERE upload_datetime BETWEEN %s AND %s", (start_date, end_date))
                    admin_media = cursor.fetchall()

                # Convert media records to a list of dictionaries
                media_list = []
                for media in admin_media:
                    media_dict = {
                        'media_id': media[0],
                        'mediatitle': media[1],
                        'media_type': media[2],
                        'upload_datetime': media[3].strftime('%Y-%m-%d %H:%M:%S'),
                        'media_data': media[4]
                    }
                    # Generate video thumbnails and convert to base64
                    if media_dict['media_type'].startswith('video'):
                        video_path = os.path.join('static/media', media_dict['media_data'])
                        thumbnail_base64 = generate_video_thumbnail(video_path)
                        media_dict['thumbnail_base64'] = thumbnail_base64

                    media_list.append(media_dict)

                # Return a JSON response with media records
                return jsonify({'media': media_list})
            except Exception as e:
                print("An error occurred:", e)
                return jsonify({'error': 'An error occurred'}), 500  # Internal Server Error
        else:
            return jsonify({'error': 'User is not an admin'}), 403  # Forbidden status code for non-admin users
    else:
        return jsonify({'error': 'User not authenticated'}), 401  # Unauthorized status code


@app.route('/manage_attendance', methods=['GET'])
def manage_attendance():
    user_id = session.get('user_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    user = fetch_user_info(cursor, user_id)

            return render_template('manage_attendance.html', user=user)

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while fetching user information"), 500

    return jsonify(message="User not logged in"), 401

@app.route('/getAttendanceForAdmin')
def get_attendance_for_admin():
    user_id = session.get('user_id')

    if user_id:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    # Fetch notes for the user
                    cursor.execute("SELECT welcare_attendance.attendance_id, users.first_name, users.last_name, users.email, welcare_attendance.attendance_datetime, welcare_attendance.videotitle, welcare_attendance.media_path, users.user_id FROM users INNER JOIN welcare_attendance ON users.user_id = welcare_attendance.user_id WHERE welcare_attendance.attendance_datetime >= %s AND welcare_attendance.attendance_datetime <= %s", (start_date, end_date))
                    welcare_attendance = cursor.fetchall()

            return jsonify(welcare_attendance=welcare_attendance)


        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while fetching diary records"), 500

    return jsonify(message="User not logged in"), 401


@app.route('/editAttendance/<int:attendance_id>', methods=['GET', 'POST'])
def edit_attendance(attendance_id):
    user_id = session.get('user_id')

    if user_id:
        if request.method == 'GET':
            try:
                # Use get_db_connection to obtain a database connection
                with get_db_connection() as db_connection:
                    with db_connection.cursor() as cursor:
                        # Fetch the attendance record to edit
                        cursor.execute("SELECT * FROM welcare_attendance WHERE attendance_id = %s", (attendance_id,))
                        attendance_record = cursor.fetchone()

                if attendance_record:
                    return render_template('edit_attendance.html', attendance_record=attendance_record)
                else:
                    return jsonify(message="Attendance record not found"), 404

            except Exception as e:
                print("An error occurred:", e)
                return jsonify(message="An error occurred while fetching attendance record"), 500

        elif request.method == 'POST':
            # Handle the form submission to update the attendance record
            new_videotitle = request.form.get('videotitle')
            new_media_path = request.form.get('media_path')

            try:
                # Use get_db_connection to obtain a database connection
                with get_db_connection() as db_connection:
                    with db_connection.cursor() as cursor:
                        # Update the attendance record
                        cursor.execute("UPDATE welcare_attendance SET videotitle = %s, media_path = %s WHERE attendance_id = %s", (new_videotitle, new_media_path, attendance_id))
                        db_connection.commit()

                return jsonify(message="Attendance record updated successfully")

            except Exception as e:
                print("An error occurred:", e)
                return jsonify(message="An error occurred while updating attendance record"), 500

    return jsonify(message="User not logged in"), 401


@app.route('/deleteAttendance/<int:attendance_id>', methods=['GET'])
def delete_attendance(attendance_id):
    user_id = session.get('user_id')

    if user_id:
        try:
            # Use get_db_connection to obtain a database connection
            with get_db_connection() as db_connection:
                with db_connection.cursor() as cursor:
                    # Check if the attendance record exists
                    cursor.execute("SELECT * FROM welcare_attendance WHERE attendance_id = %s", (attendance_id,))
                    attendance_record = cursor.fetchone()

                    if attendance_record:
                        # Delete the attendance record
                        cursor.execute("DELETE FROM welcare_attendance WHERE attendance_id = %s", (attendance_id,))
                        db_connection.commit()
                        return jsonify(message="Attendance record deleted successfully")
                    else:
                        return jsonify(message="Attendance record not found"), 404

        except Exception as e:
            print("An error occurred:", e)
            return jsonify(message="An error occurred while deleting attendance record"), 500

    return jsonify(message="User not logged in"), 401



@app.route('/staff_dashboard')
def staff_dashboard():
    user_id = session.get('user_id')

    if not user_id:
        return redirect(url_for('login'))

    try:
        # Get a database connection from the pool using the get_db_connection function
        with get_db_connection() as db_connection:
            if not db_connection:
                return "Database connection error: Unable to obtain a connection", 500

            # Successfully obtained a connection, proceed with database operations
            with db_connection.cursor() as cursor:
                user = fetch_user_info(cursor, user_id)
            return render_template('staff_dashboard.html', user=user)

    except Exception as e:
        # Handle any other exceptions that may occur
        print("An error occurred:", e)
        return "An error occurred while processing your request", 500


@app.route('/logout')
def logout():
    for key in list(session.keys()):
        session.pop(key)
    return redirect(url_for('role_select'))  # Redirect to login page


if __name__ == "__main__":
    app.run(debug=True)