-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 16, 2023 at 05:03 AM
-- Server version: 10.5.19-MariaDB-cll-lve
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION; 
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u159785945_welcarewebapp`
--
CREATE DATABASE IF NOT EXISTS `u159785945_welcarewebapp` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `u159785945_welcarewebapp`;

-- --------------------------------------------------------

--
-- Table structure for table `diary_records`
--

CREATE TABLE `diary_records` (
  `record_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `attended_datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diary_records`
--

INSERT INTO `diary_records` (`record_id`, `user_id`, `attended_datetime`) VALUES
(4, 6, '2023-09-11 05:19:00'),
(12, 13, '2023-09-08 16:39:00'),
(13, 6, '2023-09-08 16:42:00'),
(14, 1, '2023-09-08 16:42:00'),
(16, 1, '2023-09-14 16:53:00'),
(17, 1, '2023-09-09 08:34:00'),
(18, 1, '2023-09-09 08:36:00'),
(19, 1, '2023-09-09 08:37:00');

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `media_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `media_type` enum('image','video') NOT NULL,
  `mediatitle` text NOT NULL,
  `media_data` varchar(255) DEFAULT NULL,
  `upload_datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `media`
--

INSERT INTO `media` (`media_id`, `user_id`, `media_type`, `mediatitle`, `media_data`, `upload_datetime`) VALUES
(3, 14, 'image', 'title', 'WhatsApp_Image_2023-03-21_at_5.45.35_PM-removebg-preview_1.png', '2023-09-16 03:07:43'),
(4, 14, 'image', 'title', 'WhatsApp_Image_2023-03-21_at_5.45.35_PM-removebg-preview.png', '2023-09-16 03:12:01'),
(5, 14, 'image', 'title', 'WhatsApp_Image_2023-03-21_at_5.45.35_PM-removebg-preview_1.png', '2023-09-16 03:12:52'),
(6, 14, 'image', 'title', 'WhatsApp_Image_2023-03-21_at_5.45.35_PM.jpeg', '2023-09-16 03:14:19'),
(7, 14, 'image', 'title', 'allahu_akbar_allahu_akbar_Allah_is_Great._Allah_is_Great._la_ilaha_illa_allahu_There_is_no_god_save_Allah._wallahu_akbar_all.png', '2023-09-16 03:23:59'),
(8, 14, 'image', 'title', 'WhatsApp_Image_2022-07-24_at_9.20.47_PM.jpeg', '2023-09-16 03:25:15'),
(9, 14, 'image', 'title', 'X2Download.app-How_to_open_a_can_quietly_with_your_finger-480p_1.mp4', '2023-09-16 03:26:55');

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `note_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `Title` text NOT NULL,
  `note_date` date NOT NULL,
  `content` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notes`
--

INSERT INTO `notes` (`note_id`, `user_id`, `Title`, `note_date`, `content`) VALUES
(1, 6, 'Hi there.', '2023-09-16', 'Hi there. Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there. '),
(2, 6, 'sample', '2023-08-17', 'oh yes');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` enum('Admin','Staff','User') NOT NULL DEFAULT 'User',
  `profile_picture` varchar(255) DEFAULT 'default_profile_picture.png'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `first_name`, `last_name`, `password`, `role`, `profile_picture`) VALUES
(1, 'user@example.com', 'John', 'Doe', 'password123', 'Admin', 'default_profile_picture.jpg'),
(6, 'bilalahmed2520@gmail.com', 'Bilal', 'Ahmed', '1234', 'User', 'default_profile_picture.png'),
(13, 'johanjack12@gmail.com', 'Bilal', 'Ahmed', 'n.awE7y13iqt4T5.', 'User', 'default_profile_picture.jpg'),
(14, 'rohanfarooq5@gmail.com', 'Rohan', 'Farooq', 'rohan123', 'User', 'default_profile_picture.png');

-- --------------------------------------------------------

--
-- Table structure for table `welcare_attendance`
--

CREATE TABLE `welcare_attendance` (
  `attendance_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `attendance_datetime` datetime NOT NULL,
  `videotitle` text NOT NULL,
  `media_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `welcare_attendance`
--

INSERT INTO `welcare_attendance` (`attendance_id`, `user_id`, `attendance_datetime`, `videotitle`, `media_path`) VALUES
(1, 6, '2023-09-08 17:02:37', 'Sample', 'NumberLore.mp4');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `diary_records`
--
ALTER TABLE `diary_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`media_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`note_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `welcare_attendance`
--
ALTER TABLE `welcare_attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `diary_records`
--
ALTER TABLE `diary_records`
  MODIFY `record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `media`
--
ALTER TABLE `media`
  MODIFY `media_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `note_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `welcare_attendance`
--
ALTER TABLE `welcare_attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `diary_records`
--
ALTER TABLE `diary_records`
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `media`
--
ALTER TABLE `media`
  ADD CONSTRAINT `media_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `welcare_attendance`
--
ALTER TABLE `welcare_attendance`
  ADD CONSTRAINT `welcare_attendance_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
