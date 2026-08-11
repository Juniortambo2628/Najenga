-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 04, 2026 at 03:36 PM
-- Server version: 8.0.36
-- PHP Version: 8.4.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `zhpebukm_Najenga`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'login', 'User logged in', NULL, NULL, '2025-10-21 20:52:41'),
(2, 2, 'login', 'User logged in', NULL, NULL, '2025-10-21 20:52:41'),
(3, 2, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-21 21:31:58'),
(4, 2, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 16:38:44'),
(5, 2, 'logout', 'User logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 17:00:32'),
(6, 1, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 17:01:03'),
(7, 3, 'login', 'User logged in', NULL, NULL, '2025-10-22 17:23:37'),
(8, 1, 'logout', 'User logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 17:27:29'),
(9, 3, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 17:29:55'),
(10, 4, 'login', 'User logged in', NULL, NULL, '2025-10-22 17:53:41'),
(11, 3, 'logout', 'User logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 18:49:09'),
(12, 3, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 18:51:40'),
(13, 3, 'logout', 'User logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 19:38:53'),
(14, 3, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 19:53:15'),
(15, 3, 'logout', 'User logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 20:08:55'),
(16, 3, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 20:16:02'),
(17, 3, 'logout', 'User logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 20:36:52'),
(18, 3, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 20:38:52'),
(19, 4, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 20:47:09'),
(20, 4, 'logout', 'User logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 20:47:45'),
(21, 3, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 20:47:52'),
(22, 3, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-22 22:28:28'),
(23, 3, 'logout', 'User logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 23:18:46'),
(24, 3, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 23:19:41'),
(25, 3, 'logout', 'User logged out', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-22 23:27:48'),
(26, 4, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-22 23:27:54'),
(27, 4, 'logout', 'User logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 23:34:52'),
(28, 3, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 23:35:02'),
(29, 3, 'logout', 'User logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:05:28'),
(30, 3, 'login', 'User logged in', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:47:45'),
(31, 3, 'logout', 'User logged out', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:48:49'),
(32, 4, 'login', 'User logged in', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:49:04'),
(33, 4, 'logout', 'User logged out', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:50:30'),
(34, 3, 'login', 'User logged in', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:51:30'),
(35, 3, 'logout', 'User logged out', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:51:37'),
(36, 3, 'login', 'User logged in', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:52:10'),
(37, 3, 'logout', 'User logged out', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:56:03'),
(38, 5, 'register', 'User registered', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:57:10'),
(39, 5, 'login', 'User logged in', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:57:24'),
(40, 5, 'logout', 'User logged out', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:57:44'),
(41, 5, 'login', 'User logged in', '41.90.172.133', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1', '2025-10-23 01:00:54'),
(42, 5, 'logout', 'User logged out', '41.90.172.133', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1', '2025-10-23 01:01:11'),
(43, 3, 'login', 'User logged in', '41.90.172.133', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1', '2025-10-23 01:01:23'),
(44, 3, 'logout', 'User logged out', '41.90.172.133', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1', '2025-10-23 01:05:53'),
(45, 3, 'login', 'User logged in', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 06:27:02'),
(46, 3, 'logout', 'User logged out', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 06:27:11'),
(47, 3, 'login', 'User logged in', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 06:29:00'),
(48, 3, 'logout', 'User logged out', '41.90.172.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 07:30:22'),
(49, 3, 'login', 'User logged in', '41.90.172.247', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 15:25:48'),
(50, 3, 'login', 'User logged in', '41.90.172.245', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-03 10:17:18'),
(51, 3, 'login', 'User logged in', '41.90.172.245', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-03 12:36:41');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int NOT NULL,
  `project_id` int NOT NULL,
  `user_id` int NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `category` enum('drawing','permit','invoice','ticket','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `document_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `project_id`, `user_id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `title`, `description`, `category`, `document_date`, `created_at`, `updated_at`) VALUES
(1, 2, 3, 'Bedroom 1 Pln View & Elev.pdf', 'Bedroom 1 Pln View & Elev.pdf', 'assets/documents/Drawings and Sketches/Bedroom 1 Pln View & Elev.pdf', 265608, 'application/pdf', 'Bedroom 1 Pln View & Elev', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(2, 2, 3, 'Bedroom 1 View-2.pdf', 'Bedroom 1 View-2.pdf', 'assets/documents/Drawings and Sketches/Bedroom 1 View-2.pdf', 308533, 'application/pdf', 'Bedroom 1 View-2', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(3, 2, 3, 'Cabinetry Designs-280.pdf', 'Cabinetry Designs-280.pdf', 'assets/documents/Drawings and Sketches/Cabinetry Designs-280.pdf', 777047, 'application/pdf', 'Cabinetry Designs-280', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(4, 2, 3, 'Cabinetry Elevtions-38.pdf', 'Cabinetry Elevtions-38.pdf', 'assets/documents/Drawings and Sketches/Cabinetry Elevtions-38.pdf', 796244, 'application/pdf', 'Cabinetry Elevtions-38', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(5, 2, 3, 'Eng.Obam_s residence structurals 2-FDN.pdf', 'Eng.Obam_s residence structurals 2-FDN.pdf', 'assets/documents/Drawings and Sketches/Eng.Obam_s residence structurals 2-FDN.pdf', 909557, 'application/pdf', 'Eng.Obam_s residence structurals 2-FDN', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(6, 2, 3, 'Eng.Obam_s residence structurals 2-G. NOTES.pdf', 'Eng.Obam_s residence structurals 2-G. NOTES.pdf', 'assets/documents/Drawings and Sketches/Eng.Obam_s residence structurals 2-G. NOTES.pdf', 1319356, 'application/pdf', 'Eng.Obam_s residence structurals 2-G. NOTES', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(7, 2, 3, 'Eng.Obam_s residence structurals 2-GRD.pdf', 'Eng.Obam_s residence structurals 2-GRD.pdf', 'assets/documents/Drawings and Sketches/Eng.Obam_s residence structurals 2-GRD.pdf', 729152, 'application/pdf', 'Eng.Obam_s residence structurals 2-GRD', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(8, 2, 3, 'Eng.Obam_s residence structurals 2-RING BEAM AND ROOF.pdf', 'Eng.Obam_s residence structurals 2-RING BEAM AND ROOF.pdf', 'assets/documents/Drawings and Sketches/Eng.Obam_s residence structurals 2-RING BEAM AND ROOF.pdf', 738282, 'application/pdf', 'Eng.Obam_s residence structurals 2-RING BEAM AND ROOF', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(9, 2, 3, 'Eng.Obam_s residence structurals 2-TRUSSES I.pdf', 'Eng.Obam_s residence structurals 2-TRUSSES I.pdf', 'assets/documents/Drawings and Sketches/Eng.Obam_s residence structurals 2-TRUSSES I.pdf', 881243, 'application/pdf', 'Eng.Obam_s residence structurals 2-TRUSSES I', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(10, 2, 3, 'Ground Floor Plan1.pdf', 'Ground Floor Plan1.pdf', 'assets/documents/Drawings and Sketches/Ground Floor Plan1.pdf', 1110255, 'application/pdf', 'Ground Floor Plan1', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(11, 2, 3, 'Layout 01.pdf', 'Layout 01.pdf', 'assets/documents/Drawings and Sketches/Layout 01.pdf', 222092, 'application/pdf', 'Layout 01', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(12, 2, 3, 'Layout 02.pdf', 'Layout 02.pdf', 'assets/documents/Drawings and Sketches/Layout 02.pdf', 264287, 'application/pdf', 'Layout 02', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(13, 2, 3, 'Option 2.pdf', 'Option 2.pdf', 'assets/documents/Drawings and Sketches/Option 2.pdf', 97174, 'application/pdf', 'Option 2', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(14, 2, 3, 'Option 3 Attic Level.pdf', 'Option 3 Attic Level.pdf', 'assets/documents/Drawings and Sketches/Option 3 Attic Level.pdf', 38340, 'application/pdf', 'Option 3 Attic Level', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(15, 2, 3, 'Option 3 Ground Floor.pdf', 'Option 3 Ground Floor.pdf', 'assets/documents/Drawings and Sketches/Option 3 Ground Floor.pdf', 97047, 'application/pdf', 'Option 3 Ground Floor', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(16, 2, 3, 'PRICED BQ BUILDER_S WORK PROPOSED RESIDENTIAL HOUSE FOR DANIIEL ONYANGO OBAM IN BUSIA COUNTY.pdf', 'PRICED BQ BUILDER_S WORK PROPOSED RESIDENTIAL HOUSE FOR DANIIEL ONYANGO OBAM IN BUSIA COUNTY.pdf', 'assets/documents/Drawings and Sketches/PRICED BQ BUILDER_S WORK PROPOSED RESIDENTIAL HOUSE FOR DANIIEL ONYANGO OBAM IN BUSIA COUNTY.pdf', 369175, 'application/pdf', 'PRICED BQ BUILDER_S WORK PROPOSED RESIDENTIAL HOUSE FOR DANIIEL ONYANGO OBAM IN BUSIA COUNTY', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(17, 2, 3, 'Proposed Brief Obam Residence Busia County.pdf', 'Proposed Brief Obam Residence Busia County.pdf', 'assets/documents/Drawings and Sketches/Proposed Brief Obam Residence Busia County.pdf', 767414, 'application/pdf', 'Proposed Brief Obam Residence Busia County', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(18, 2, 3, 'Water tank 118c.m-TCESTR 50206.pdf', 'Water tank 118c.m-TCESTR 50206.pdf', 'assets/documents/Drawings and Sketches/Water tank 118c.m-TCESTR 50206.pdf', 135128, 'application/pdf', 'Water tank 118c.m-TCESTR 50206', 'Architectural drawing and design document', 'drawing', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(19, 2, 3, 'Boarding pass- NBI-KSM-02042025-DO.pdf', 'Boarding pass- NBI-KSM-02042025-DO.pdf', 'assets/documents/Flight Tickets/02-04-25/Boarding pass- NBI-KSM-02042025-DO.pdf', 84534, 'application/pdf', 'Boarding pass- NBI-KSM-02042025-DO', 'Flight ticket for project site visit', 'ticket', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(20, 2, 3, 'Boarding pass- NBI-KSM-02042025-HT.pdf', 'Boarding pass- NBI-KSM-02042025-HT.pdf', 'assets/documents/Flight Tickets/02-04-25/Boarding pass- NBI-KSM-02042025-HT.pdf', 84584, 'application/pdf', 'Boarding pass- NBI-KSM-02042025-HT', 'Flight ticket for project site visit', 'ticket', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(21, 2, 3, 'Boarding pass- NBI-KSM-02042025-JK.pdf', 'Boarding pass- NBI-KSM-02042025-JK.pdf', 'assets/documents/Flight Tickets/02-04-25/Boarding pass- NBI-KSM-02042025-JK.pdf', 84639, 'application/pdf', 'Boarding pass- NBI-KSM-02042025-JK', 'Flight ticket for project site visit', 'ticket', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(22, 2, 3, 'Ticket-CN 05022025.pdf', 'Ticket-CN 05022025.pdf', 'assets/documents/Flight Tickets/15-02-2025/Ticket-CN 05022025.pdf', 253723, 'application/pdf', 'Ticket-CN 05022025', 'Flight ticket for project site visit', 'ticket', '2025-02-15', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(23, 2, 3, 'Ticket-DO 05022025.pdf', 'Ticket-DO 05022025.pdf', 'assets/documents/Flight Tickets/15-02-2025/Ticket-DO 05022025.pdf', 253847, 'application/pdf', 'Ticket-DO 05022025', 'Flight ticket for project site visit', 'ticket', '2025-02-15', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(24, 2, 3, 'Ticket-JK 05022025.pdf', 'Ticket-JK 05022025.pdf', 'assets/documents/Flight Tickets/15-02-2025/Ticket-JK 05022025.pdf', 253721, 'application/pdf', 'Ticket-JK 05022025', 'Flight ticket for project site visit', 'ticket', '2025-02-15', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(25, 2, 3, 'Receipt-16-09_KQ_TICKET_CATHERINE M NZUKI.pdf', 'Receipt-16-09_KQ_TICKET_CATHERINE M NZUKI.pdf', 'assets/documents/Flight Tickets/16-09-2025/Receipt-16-09_KQ_TICKET_CATHERINE M NZUKI.pdf', 289194, 'application/pdf', 'Receipt-16-09_KQ_TICKET_CATHERINE M NZUKI', 'Flight ticket for project site visit', 'ticket', '2025-09-16', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(26, 2, 3, 'Receipt-16-09_KQ_TICKET_DANIEL ONYANGO OBAM.pdf', 'Receipt-16-09_KQ_TICKET_DANIEL ONYANGO OBAM.pdf', 'assets/documents/Flight Tickets/16-09-2025/Receipt-16-09_KQ_TICKET_DANIEL ONYANGO OBAM.pdf', 289312, 'application/pdf', 'Receipt-16-09_KQ_TICKET_DANIEL ONYANGO OBAM', 'Flight ticket for project site visit', 'ticket', '2025-09-16', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(27, 2, 3, 'Receipt-16-09_KQ_TICKET_HAGGAI O TAMBO.pdf', 'Receipt-16-09_KQ_TICKET_HAGGAI O TAMBO.pdf', 'assets/documents/Flight Tickets/16-09-2025/Receipt-16-09_KQ_TICKET_HAGGAI O TAMBO.pdf', 289194, 'application/pdf', 'Receipt-16-09_KQ_TICKET_HAGGAI O TAMBO', 'Flight ticket for project site visit', 'ticket', '2025-09-16', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(28, 2, 3, 'Receipt-16-09_KQ_TICKET_JUSTUS_KIOKO.pdf', 'Receipt-16-09_KQ_TICKET_JUSTUS_KIOKO.pdf', 'assets/documents/Flight Tickets/16-09-2025/Receipt-16-09_KQ_TICKET_JUSTUS_KIOKO.pdf', 289187, 'application/pdf', 'Receipt-16-09_KQ_TICKET_JUSTUS_KIOKO', 'Flight ticket for project site visit', 'ticket', '2025-09-16', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(29, 2, 3, 'Kenya Airways E-Documents for CATHERINE MUKONYO NZUKI 18102025.pdf', 'Kenya Airways E-Documents for CATHERINE MUKONYO NZUKI 18102025.pdf', 'assets/documents/Flight Tickets/Flight-Tickets-18-Oct/Kenya Airways E-Documents for CATHERINE MUKONYO NZUKI 18102025.pdf', 289195, 'application/pdf', 'Kenya Airways E-Documents for CATHERINE MUKONYO NZUKI 18102025', 'Flight ticket for project site visit', 'ticket', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(30, 2, 3, 'Kenya Airways E-Documents for DANIEL ONYANGO OBAM 18102025.pdf', 'Kenya Airways E-Documents for DANIEL ONYANGO OBAM 18102025.pdf', 'assets/documents/Flight Tickets/Flight-Tickets-18-Oct/Kenya Airways E-Documents for DANIEL ONYANGO OBAM 18102025.pdf', 289623, 'application/pdf', 'Kenya Airways E-Documents for DANIEL ONYANGO OBAM 18102025', 'Flight ticket for project site visit', 'ticket', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(31, 2, 3, 'Kenya Airways E-Documents for JUSTUS KIOKO 18102025.pdf', 'Kenya Airways E-Documents for JUSTUS KIOKO 18102025.pdf', 'assets/documents/Flight Tickets/Flight-Tickets-18-Oct/Kenya Airways E-Documents for JUSTUS KIOKO 18102025.pdf', 289231, 'application/pdf', 'Kenya Airways E-Documents for JUSTUS KIOKO 18102025', 'Flight ticket for project site visit', 'ticket', '2025-01-01', '2025-10-22 16:57:59', '2025-10-22 17:23:37');

-- --------------------------------------------------------

--
-- Table structure for table `document_annotations`
--

CREATE TABLE `document_annotations` (
  `id` int NOT NULL,
  `document_id` int NOT NULL,
  `user_id` int NOT NULL,
  `page_number` int NOT NULL,
  `annotation_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `annotation_type` enum('drawing','highlight','text','shape') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'drawing',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_comments`
--

CREATE TABLE `document_comments` (
  `id` int NOT NULL,
  `document_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment_type` enum('issue','note','approval','question') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'note',
  `page_number` int DEFAULT NULL,
  `x_position` float DEFAULT NULL,
  `y_position` float DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_logs`
--

CREATE TABLE `email_logs` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `email_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` int DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `email_logs`
--

INSERT INTO `email_logs` (`id`, `user_id`, `email_type`, `reference_id`, `sent_at`) VALUES
(1, 4, 'project_share', 1, '2025-10-22 20:48:43');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int NOT NULL,
  `project_id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expense_date` date NOT NULL,
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `project_id`, `user_id`, `title`, `description`, `amount`, `currency`, `category`, `payment_method`, `receipt_id`, `expense_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'Foundation Materials', 'Cement, sand, and aggregates for foundation', 45000.00, 'KES', 'Materials', 'Cash', NULL, '2024-02-15', 'approved', '2025-10-21 20:38:38', '2025-10-21 20:38:38'),
(2, 1, 2, 'Labor Costs - February', 'Payment for construction workers', 25000.00, 'KES', 'Labor', 'Bank Transfer', NULL, '2024-02-28', 'approved', '2025-10-21 20:38:38', '2025-10-21 20:38:38'),
(3, 1, 2, 'Steel Reinforcement', 'Steel bars for foundation and structure', 38000.00, 'KES', 'Materials', 'Cash', NULL, '2024-03-05', 'pending', '2025-10-21 20:38:38', '2025-10-21 20:38:38'),
(4, 2, 3, 'Expense - PHOTO-2025-05-05-12-22-47', 'Construction expense for January', 38463.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(5, 2, 3, 'Expense - PHOTO-2025-05-05-11-28-51(1)', 'Construction expense for February', 31602.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(6, 2, 3, 'Expense - PHOTO-2025-05-05-11-28-51', 'Construction expense for February', 28035.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(7, 2, 3, 'Expense - PHOTO-2025-05-05-11-28-52(1)', 'Construction expense for February', 20970.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(8, 2, 3, 'Expense - PHOTO-2025-05-05-11-28-52', 'Construction expense for February', 77058.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(9, 2, 3, 'Expense - PHOTO-2025-05-05-11-28-53', 'Construction expense for February', 92350.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(10, 2, 3, 'Expense - PHOTO-2025-05-05-12-14-45', 'Construction expense for February', 94919.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(11, 2, 3, 'Expense - WhatsApp Image 2025-05-12 at 09.05.33_5401118c', 'Construction expense for February', 141495.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-12', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(12, 2, 3, 'Expense - e-receipt_Domestic_Funds_Transfer_102493391335129', 'Construction expense for February', 89057.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-02-15', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(13, 2, 3, 'Expense - INTERIM CERTIFICATE 1- PAYMENT 1', 'Construction expense for March', 147549.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-03-15', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(14, 2, 3, 'Expense - INTERIM CERTIFICATE 1- PAYMENT 2', 'Construction expense for March', 135073.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-03-15', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(15, 2, 3, 'Expense - INTERIM CERTIFICATE 1- PAYMENT 3', 'Construction expense for March', 22348.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-03-15', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(16, 2, 3, 'Expense - PHOTO-2025-05-05-11-28-56', 'Construction expense for March', 96025.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(17, 2, 3, 'Expense - PHOTO-2025-05-05-11-28-57', 'Construction expense for March', 134358.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(18, 2, 3, 'Expense - PHOTO-2025-05-05-11-28-59(1)', 'Construction expense for March', 96277.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(19, 2, 3, 'Expense - PHOTO-2025-05-05-11-28-59(2)', 'Construction expense for March', 148001.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(20, 2, 3, 'Expense - PHOTO-2025-05-05-11-28-59', 'Construction expense for March', 115066.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(21, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-00(1)', 'Construction expense for March', 148864.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(22, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-00(2)', 'Construction expense for March', 27308.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(23, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-00', 'Construction expense for March', 135400.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(24, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-01', 'Construction expense for March', 35148.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(25, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-02(1)', 'Construction expense for March', 32793.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(26, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-02(2)', 'Construction expense for March', 100121.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(27, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-02', 'Construction expense for March', 78997.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(28, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-03(1)', 'Construction expense for March', 106801.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(29, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-03', 'Construction expense for March', 55096.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(30, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-04(1)', 'Construction expense for March', 129582.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(31, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-04', 'Construction expense for March', 50925.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:57:59', '2025-10-22 17:33:54'),
(32, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-05', 'Construction expense for March', 30188.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(33, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-07', 'Construction expense for March', 60673.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(34, 2, 3, 'Expense - Receipt_TCE3NQEOPV', 'Construction expense for March', 144332.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-03-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(35, 2, 3, 'Expense - Receipt_TCK4G1E60M', 'Construction expense for March', 64047.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-03-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(36, 2, 3, 'Expense - Receipt_TCK9G0RX0D', 'Construction expense for March', 101431.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-03-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(37, 2, 3, 'Expense - WhatsApp Image 2025-05-12 at 09.08.18_8a1abaeb', 'Construction expense for March', 37320.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-12', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(38, 2, 3, 'Expense - WhatsApp Image 2025-05-12 at 09.09.21_0b485795', 'Construction expense for March', 17315.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-12', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(39, 2, 3, 'Expense - WhatsApp Image 2025-05-12 at 09.10.46_d5d0876b', 'Construction expense for March', 11162.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-12', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(40, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-05', 'Construction expense for April', 67653.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(41, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-06(1)', 'Construction expense for April', 58332.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(42, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-06', 'Construction expense for April', 101495.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(43, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-09', 'Construction expense for April', 38230.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(44, 2, 3, 'Expense - PHOTO-2025-05-05-11-29-10', 'Construction expense for May', 25701.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-05', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(45, 2, 3, 'Expense - PHOTO-2025-05-08-18-17-36', 'Construction expense for May', 49678.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-08', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(46, 2, 3, 'Expense - WhatsApp Image 2025-05-19 at 09.06.13_ae2d602f', 'Construction expense for May', 63180.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-19', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(47, 2, 3, 'Expense - WhatsApp Image 2025-05-22 at 18.23.44_07f05da9', 'Construction expense for May', 121487.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-22', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(48, 2, 3, 'Expense - WhatsApp Image 2025-05-22 at 18.41.11_43f93eed', 'Construction expense for May', 66647.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-22', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(49, 2, 3, 'Expense - r1=MgrI3ZHw', 'Construction expense for May', 36312.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-05-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(50, 2, 3, 'Expense - PR_0625 - Dano Busia Project Requirements', 'Construction expense for June', 81066.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-06-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(51, 2, 3, 'Expense - PR_0625 Invoice', 'Construction expense for June', 105461.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-06-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(52, 2, 3, 'Expense - PR_0625-01 - Receipt', 'Construction expense for June', 13701.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-06-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(53, 2, 3, 'Expense - PR_0625-02 - Receipt', 'Construction expense for June', 133334.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-06-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(54, 2, 3, 'Expense - PR_0625-03 - Receipt', 'Construction expense for June', 10287.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-06-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(55, 2, 3, 'Expense - 02PR_0625-01 - Receipt', 'Construction expense for June', 77504.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-06-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(56, 2, 3, 'Expense - PR_0625 - Dano Busia Project Requirements 2', 'Construction expense for June', 26884.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-06-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(57, 2, 3, 'Expense - 02PR_0625-01 - Receipt.JPG', 'Construction expense for June', 108567.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-06-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(58, 2, 3, 'Expense - Quotation for Elevated Water Tank 20250616_11183447', 'Construction expense for June', 126992.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-06-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(59, 2, 3, 'Expense - 01PR_0725-1 - Receipt', 'Construction expense for July', 53178.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-07-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(60, 2, 3, 'Expense - 01PR_0725-1 - Request', 'Construction expense for July', 49922.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-07-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(61, 2, 3, 'Expense - 02PR_0725-1 - Receipt', 'Construction expense for July', 31932.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-07-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(62, 2, 3, 'Expense - 02PR_0725-1 - Request', 'Construction expense for July', 59141.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-07-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(63, 2, 3, 'Expense - 03PR_0725-01 - Request', 'Construction expense for July', 26043.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-07-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(64, 2, 3, 'Expense - 03PR_0725-1 - Receipt', 'Construction expense for July', 143386.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-07-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(65, 2, 3, 'Expense - 04PR_0725-1 -  Receipt', 'Construction expense for July', 38089.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-07-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(66, 2, 3, 'Expense - 04PR_0725-1 -  Request(1)', 'Construction expense for July', 77292.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-07-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(67, 2, 3, 'Expense - 04PR_0725-1 -  Request(2)', 'Construction expense for July', 86524.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-07-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(68, 2, 3, 'Expense - 04PR_0725-2 -  Receipt', 'Construction expense for July', 32327.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-07-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(69, 2, 3, 'Expense - 04PR_0725-2 -  Request', 'Construction expense for July', 63124.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-07-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(70, 2, 3, 'Expense - 05PR_0725-1 - Request & Receipt', 'Construction expense for July', 135601.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-07-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(71, 2, 3, 'Expense - 01PR_0825-1 -  Receipt', 'Construction expense for August', 141453.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(72, 2, 3, 'Expense - 01PR_0825-1 -  Request', 'Construction expense for August', 85372.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(73, 2, 3, 'Expense - 01PR_0825-2 -  Receipt', 'Construction expense for August', 139312.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(74, 2, 3, 'Expense - 01PR_0825-3 -  Receipt (Flight Bookings)', 'Construction expense for August', 113622.00, 'KES', 'Travel', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(75, 2, 3, 'Expense - 01PR_0825-3 -  Receipt', 'Construction expense for August', 5660.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(76, 2, 3, 'Expense - 01PR_0825-3 -  Receipt', 'Construction expense for August', 106521.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(77, 2, 3, 'Expense - 02PR_0825-4 -  Receipt', 'Construction expense for August', 123856.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(78, 2, 3, 'Expense - 03PR_0825-1 -  Receipt', 'Construction expense for August', 22738.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(79, 2, 3, 'Expense - 03PR_0825-2 -  Receipt', 'Construction expense for August', 107713.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(80, 2, 3, 'Expense - 03PR_0825-3 -  Receipt', 'Construction expense for August', 68319.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(81, 2, 3, 'Expense - 03PR_0825-4 -  Receipt', 'Construction expense for August', 40709.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(82, 2, 3, 'Expense - 04PR_0825- 3 - Request and Receipt', 'Construction expense for August', 31419.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(83, 2, 3, 'Expense - 04PR_0825-1 -  Receipt', 'Construction expense for August', 109962.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(84, 2, 3, 'Expense - 04PR_0825-2-  Request and Receipt', 'Construction expense for August', 45559.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(85, 2, 3, 'Expense - 05PR_0825-1 -  Receipt-1', 'Construction expense for August', 16898.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(86, 2, 3, 'Expense - 05PR_0825-1 -  Receipt', 'Construction expense for August', 132689.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(87, 2, 3, 'Expense - 05PR_0825-1 -  Request', 'Construction expense for August', 137673.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(88, 2, 3, 'Expense - Cabinetry Designs-280', 'Construction expense for August', 106941.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(89, 2, 3, 'Expense - Cabinetry Elevtions-38', 'Construction expense for August', 18250.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-08-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(90, 2, 3, 'Expense - 01PR_0925 -Receipt', 'Construction expense for September', 63218.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(91, 2, 3, 'Expense - IPC No. 03 - Thura - Busia', 'Construction expense for September', 113345.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(92, 2, 3, 'Expense - Receipt-3-09_HAGGAI_TAMBO', 'Construction expense for September', 69376.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(93, 2, 3, 'Expense - Receipt-15-09_PLUMBING_DRAINAGE_WORKS', 'Construction expense for September', 113734.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(94, 2, 3, 'Expense - Receipt-16-09_KQ_TICKETS', 'Construction expense for September', 57718.00, 'KES', 'Travel', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(95, 2, 3, 'Expense - Receipt-16-09_KQ_TICKET_CATHERINE M NZUKI', 'Construction expense for September', 9574.00, 'KES', 'Travel', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(96, 2, 3, 'Expense - Receipt-16-09_KQ_TICKET_CHANGE', 'Construction expense for September', 76653.00, 'KES', 'Travel', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(97, 2, 3, 'Expense - Receipt-16-09_KQ_TICKET_DANIEL ONYANGO OBAM', 'Construction expense for September', 88272.00, 'KES', 'Travel', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(98, 2, 3, 'Expense - Receipt-16-09_KQ_TICKET_HAGGAI O TAMBO', 'Construction expense for September', 101330.00, 'KES', 'Travel', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(99, 2, 3, 'Expense - Receipt-16-09_KQ_TICKET_JUSTUS_KIOKO', 'Construction expense for September', 30659.00, 'KES', 'Travel', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(100, 2, 3, 'Expense - SEP-15_FTC250915QWZZ_RECEIPT_BIC', 'Construction expense for September', 32792.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(101, 2, 3, 'Expense - SEP-15_FTC250915QWZZ_REQUEST_BIC', 'Construction expense for September', 110762.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(102, 2, 3, 'Expense - 01-Request-25-09_VINCENT ', 'Construction expense for September', 85896.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(103, 2, 3, 'Expense - 02-Request-25-09_VINCENT', 'Construction expense for September', 22760.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(104, 2, 3, 'Expense - Receipt-25-09_DIRECTPAY_HQ - 2AIRTICKETS(18THOCT)', 'Construction expense for September', 11909.00, 'KES', 'Travel', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(105, 2, 3, 'Expense - Receipt-25-09_DIRECTPAY_HQ', 'Construction expense for September', 126086.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(106, 2, 3, 'Expense - Receipt-25-09_FOOD_FOR_SITE_MEETING', 'Construction expense for September', 69020.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(107, 2, 3, 'Expense - Receipt-25-09_VINCENT', 'Construction expense for September', 118340.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(108, 2, 3, 'Expense - Receipt-26-09_CAR_HIRE_DRIVER', 'Construction expense for September', 18875.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(109, 2, 3, 'Expense - Receipt-26-09_FOOD', 'Construction expense for September', 134907.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(110, 2, 3, 'Expense - Receipt-26-09_FUEL_SUPPLIES', 'Construction expense for September', 7623.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(111, 2, 3, 'Expense - Receipt-26-09_SPLITTING', 'Construction expense for September', 132941.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(112, 2, 3, 'Expense - Receipt-26-09_VINCENT(REQUEST)', 'Construction expense for September', 37610.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-09-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(113, 2, 3, 'Expense - Receipt-08-Oct-Etihad-Waterways', 'Construction expense for October', 136714.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-10-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(114, 2, 3, 'Expense - Receipt-09-Oct-Daniel-Ochondo', 'Construction expense for October', 148614.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-10-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(115, 2, 3, 'Expense - Receipt-13-Jumbo-Steel-Mills', 'Construction expense for October', 61818.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-10-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(116, 2, 3, 'Expense - Request-08-Oct-Etihad-Waterways', 'Construction expense for October', 136723.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-10-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(117, 2, 3, 'Expense - Request-09-Oct-Daniel-Ochondo', 'Construction expense for October', 23439.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-10-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(118, 2, 3, 'Expense - Request-13-Jumbo-Steel-Mills', 'Construction expense for October', 32150.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-10-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54'),
(119, 2, 3, 'Expense - Request2-08-Oct-Etihad-Waterways', 'Construction expense for October', 118814.00, 'KES', 'General', 'Bank Transfer', NULL, '2025-10-15', 'approved', '2025-10-22 16:58:00', '2025-10-22 17:33:54');

-- --------------------------------------------------------

--
-- Table structure for table `photos`
--

CREATE TABLE `photos` (
  `id` int NOT NULL,
  `project_id` int NOT NULL,
  `user_id` int NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_date` date DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `photos`
--

INSERT INTO `photos` (`id`, `project_id`, `user_id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `title`, `description`, `category`, `photo_date`, `is_featured`, `created_at`, `updated_at`) VALUES
(1, 2, 3, 'WhatsApp Image 2025-02-18 at 17.41.30_185d1eb1.jpg', 'WhatsApp Image 2025-02-18 at 17.41.30_185d1eb1.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-18 at 17.41.30_185d1eb1.jpg', 240707, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-18', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(2, 2, 3, 'WhatsApp Image 2025-02-18 at 17.41.31_0759188a.jpg', 'WhatsApp Image 2025-02-18 at 17.41.31_0759188a.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-18 at 17.41.31_0759188a.jpg', 202551, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-18', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(3, 2, 3, 'WhatsApp Image 2025-02-18 at 17.41.31_3441b40e.jpg', 'WhatsApp Image 2025-02-18 at 17.41.31_3441b40e.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-18 at 17.41.31_3441b40e.jpg', 193232, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-18', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(4, 2, 3, 'WhatsApp Image 2025-02-18 at 17.41.31_8853a5a1.jpg', 'WhatsApp Image 2025-02-18 at 17.41.31_8853a5a1.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-18 at 17.41.31_8853a5a1.jpg', 161404, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-18', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(5, 2, 3, 'WhatsApp Image 2025-02-18 at 17.41.31_c5b54c12.jpg', 'WhatsApp Image 2025-02-18 at 17.41.31_c5b54c12.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-18 at 17.41.31_c5b54c12.jpg', 193476, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-18', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(6, 2, 3, 'WhatsApp Image 2025-02-21 at 20.37.15_00ff46a3.jpg', 'WhatsApp Image 2025-02-21 at 20.37.15_00ff46a3.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-21 at 20.37.15_00ff46a3.jpg', 173565, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-21', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(7, 2, 3, 'WhatsApp Image 2025-02-25 at 15.46.05_1c580d23.jpg', 'WhatsApp Image 2025-02-25 at 15.46.05_1c580d23.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-25 at 15.46.05_1c580d23.jpg', 228248, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-25', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(8, 2, 3, 'WhatsApp Image 2025-02-25 at 15.46.05_f2099741.jpg', 'WhatsApp Image 2025-02-25 at 15.46.05_f2099741.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-25 at 15.46.05_f2099741.jpg', 194230, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-25', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(9, 2, 3, 'WhatsApp Image 2025-02-25 at 17.24.18_da31aec8.jpg', 'WhatsApp Image 2025-02-25 at 17.24.18_da31aec8.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-25 at 17.24.18_da31aec8.jpg', 163822, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-25', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(10, 2, 3, 'WhatsApp Image 2025-02-26 at 19.47.08_29770079.jpg', 'WhatsApp Image 2025-02-26 at 19.47.08_29770079.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-26 at 19.47.08_29770079.jpg', 170658, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-26', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(11, 2, 3, 'WhatsApp Image 2025-02-26 at 19.47.09_72d03d2a.jpg', 'WhatsApp Image 2025-02-26 at 19.47.09_72d03d2a.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-26 at 19.47.09_72d03d2a.jpg', 218824, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-26', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(12, 2, 3, 'WhatsApp Image 2025-02-26 at 19.47.39_b646bf26.jpg', 'WhatsApp Image 2025-02-26 at 19.47.39_b646bf26.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-26 at 19.47.39_b646bf26.jpg', 214585, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-26', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(13, 2, 3, 'WhatsApp Image 2025-02-26 at 19.47.39_d80bef38.jpg', 'WhatsApp Image 2025-02-26 at 19.47.39_d80bef38.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-26 at 19.47.39_d80bef38.jpg', 214585, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-26', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(14, 2, 3, 'WhatsApp Image 2025-02-26 at 19.47.40_a81ede1e.jpg', 'WhatsApp Image 2025-02-26 at 19.47.40_a81ede1e.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-26 at 19.47.40_a81ede1e.jpg', 210156, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-26', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(15, 2, 3, 'WhatsApp Image 2025-02-27 at 15.47.49_7b8d28e7.jpg', 'WhatsApp Image 2025-02-27 at 15.47.49_7b8d28e7.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-27 at 15.47.49_7b8d28e7.jpg', 168589, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-27', 0, '2025-10-22 16:57:52', '2025-10-22 17:23:37'),
(16, 2, 3, 'WhatsApp Image 2025-02-27 at 15.47.49_dfc1b64e.jpg', 'WhatsApp Image 2025-02-27 at 15.47.49_dfc1b64e.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-27 at 15.47.49_dfc1b64e.jpg', 228401, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-27', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(17, 2, 3, 'WhatsApp Image 2025-02-28 at 12.51.17_12a7b642.jpg', 'WhatsApp Image 2025-02-28 at 12.51.17_12a7b642.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-28 at 12.51.17_12a7b642.jpg', 176373, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-28', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(18, 2, 3, 'WhatsApp Image 2025-02-28 at 12.51.17_348357fe.jpg', 'WhatsApp Image 2025-02-28 at 12.51.17_348357fe.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-28 at 12.51.17_348357fe.jpg', 176373, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-28', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(19, 2, 3, 'WhatsApp Image 2025-02-28 at 12.51.17_55063a84.jpg', 'WhatsApp Image 2025-02-28 at 12.51.17_55063a84.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-28 at 12.51.17_55063a84.jpg', 270772, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-28', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(20, 2, 3, 'WhatsApp Image 2025-02-28 at 12.51.17_9a4cfe21.jpg', 'WhatsApp Image 2025-02-28 at 12.51.17_9a4cfe21.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-28 at 12.51.17_9a4cfe21.jpg', 255109, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-28', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(21, 2, 3, 'WhatsApp Image 2025-02-28 at 12.51.17_f7f216c1.jpg', 'WhatsApp Image 2025-02-28 at 12.51.17_f7f216c1.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-28 at 12.51.17_f7f216c1.jpg', 231643, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-28', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(22, 2, 3, 'WhatsApp Image 2025-02-28 at 12.51.18_d52ee647.jpg', 'WhatsApp Image 2025-02-28 at 12.51.18_d52ee647.jpg', 'assets/Photos/February/WhatsApp Image 2025-02-28 at 12.51.18_d52ee647.jpg', 143887, 'image/jpeg', 'Construction Photo - February', 'Photo from February construction activities', 'Foundation', '2025-02-28', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(23, 2, 3, 'IMG-20250320-WA0011.jpg', 'IMG-20250320-WA0011.jpg', 'assets/Photos/March/IMG-20250320-WA0011.jpg', 163444, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(24, 2, 3, 'IMG-20250320-WA0012.jpg', 'IMG-20250320-WA0012.jpg', 'assets/Photos/March/IMG-20250320-WA0012.jpg', 70993, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(25, 2, 3, 'IMG-20250320-WA0013.jpg', 'IMG-20250320-WA0013.jpg', 'assets/Photos/March/IMG-20250320-WA0013.jpg', 83950, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(26, 2, 3, 'IMG-20250320-WA0014.jpg', 'IMG-20250320-WA0014.jpg', 'assets/Photos/March/IMG-20250320-WA0014.jpg', 161652, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(27, 2, 3, 'IMG-20250320-WA0015.jpg', 'IMG-20250320-WA0015.jpg', 'assets/Photos/March/IMG-20250320-WA0015.jpg', 192987, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(28, 2, 3, 'IMG-20250320-WA0016.jpg', 'IMG-20250320-WA0016.jpg', 'assets/Photos/March/IMG-20250320-WA0016.jpg', 165569, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(29, 2, 3, 'IMG-20250320-WA0017.jpg', 'IMG-20250320-WA0017.jpg', 'assets/Photos/March/IMG-20250320-WA0017.jpg', 157929, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(30, 2, 3, 'IMG-20250320-WA0018.jpg', 'IMG-20250320-WA0018.jpg', 'assets/Photos/March/IMG-20250320-WA0018.jpg', 113173, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(31, 2, 3, 'IMG-20250320-WA0019.jpg', 'IMG-20250320-WA0019.jpg', 'assets/Photos/March/IMG-20250320-WA0019.jpg', 97040, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(32, 2, 3, 'IMG-20250320-WA0020.jpg', 'IMG-20250320-WA0020.jpg', 'assets/Photos/March/IMG-20250320-WA0020.jpg', 150602, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(33, 2, 3, 'IMG-20250320-WA0021.jpg', 'IMG-20250320-WA0021.jpg', 'assets/Photos/March/IMG-20250320-WA0021.jpg', 146906, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(34, 2, 3, 'IMG-20250320-WA0022.jpg', 'IMG-20250320-WA0022.jpg', 'assets/Photos/March/IMG-20250320-WA0022.jpg', 248380, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(35, 2, 3, 'IMG-20250320-WA0023.jpg', 'IMG-20250320-WA0023.jpg', 'assets/Photos/March/IMG-20250320-WA0023.jpg', 279791, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(36, 2, 3, 'IMG-20250320-WA0024.jpg', 'IMG-20250320-WA0024.jpg', 'assets/Photos/March/IMG-20250320-WA0024.jpg', 241966, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(37, 2, 3, 'IMG-20250320-WA0025.jpg', 'IMG-20250320-WA0025.jpg', 'assets/Photos/March/IMG-20250320-WA0025.jpg', 213702, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(38, 2, 3, 'IMG-20250320-WA0026.jpg', 'IMG-20250320-WA0026.jpg', 'assets/Photos/March/IMG-20250320-WA0026.jpg', 206640, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(39, 2, 3, 'IMG-20250320-WA0027.jpg', 'IMG-20250320-WA0027.jpg', 'assets/Photos/March/IMG-20250320-WA0027.jpg', 219429, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(40, 2, 3, 'IMG-20250320-WA0028.jpg', 'IMG-20250320-WA0028.jpg', 'assets/Photos/March/IMG-20250320-WA0028.jpg', 277101, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(41, 2, 3, 'IMG-20250320-WA0029.jpg', 'IMG-20250320-WA0029.jpg', 'assets/Photos/March/IMG-20250320-WA0029.jpg', 312214, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(42, 2, 3, 'IMG-20250320-WA0030.jpg', 'IMG-20250320-WA0030.jpg', 'assets/Photos/March/IMG-20250320-WA0030.jpg', 301985, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(43, 2, 3, 'IMG-20250320-WA0031.jpg', 'IMG-20250320-WA0031.jpg', 'assets/Photos/March/IMG-20250320-WA0031.jpg', 203220, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(44, 2, 3, 'IMG-20250320-WA0032.jpg', 'IMG-20250320-WA0032.jpg', 'assets/Photos/March/IMG-20250320-WA0032.jpg', 282381, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(45, 2, 3, 'IMG-20250320-WA0033.jpg', 'IMG-20250320-WA0033.jpg', 'assets/Photos/March/IMG-20250320-WA0033.jpg', 226934, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(46, 2, 3, 'IMG-20250320-WA0034.jpg', 'IMG-20250320-WA0034.jpg', 'assets/Photos/March/IMG-20250320-WA0034.jpg', 270709, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(47, 2, 3, 'IMG-20250320-WA0035.jpg', 'IMG-20250320-WA0035.jpg', 'assets/Photos/March/IMG-20250320-WA0035.jpg', 256567, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(48, 2, 3, 'IMG-20250320-WA0036.jpg', 'IMG-20250320-WA0036.jpg', 'assets/Photos/March/IMG-20250320-WA0036.jpg', 309968, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(49, 2, 3, 'IMG-20250320-WA0037.jpg', 'IMG-20250320-WA0037.jpg', 'assets/Photos/March/IMG-20250320-WA0037.jpg', 300815, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(50, 2, 3, 'IMG-20250320-WA0038.jpg', 'IMG-20250320-WA0038.jpg', 'assets/Photos/March/IMG-20250320-WA0038.jpg', 192576, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(51, 2, 3, 'IMG-20250320-WA0039.jpg', 'IMG-20250320-WA0039.jpg', 'assets/Photos/March/IMG-20250320-WA0039.jpg', 207755, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(52, 2, 3, 'IMG-20250320-WA0040.jpg', 'IMG-20250320-WA0040.jpg', 'assets/Photos/March/IMG-20250320-WA0040.jpg', 305378, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(53, 2, 3, 'IMG-20250320-WA0041.jpg', 'IMG-20250320-WA0041.jpg', 'assets/Photos/March/IMG-20250320-WA0041.jpg', 196959, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(54, 2, 3, 'IMG-20250320-WA0042.jpg', 'IMG-20250320-WA0042.jpg', 'assets/Photos/March/IMG-20250320-WA0042.jpg', 296040, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(55, 2, 3, 'IMG-20250320-WA0043.jpg', 'IMG-20250320-WA0043.jpg', 'assets/Photos/March/IMG-20250320-WA0043.jpg', 262918, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(56, 2, 3, 'IMG-20250320-WA0044.jpg', 'IMG-20250320-WA0044.jpg', 'assets/Photos/March/IMG-20250320-WA0044.jpg', 313773, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(57, 2, 3, 'IMG-20250320-WA0045.jpg', 'IMG-20250320-WA0045.jpg', 'assets/Photos/March/IMG-20250320-WA0045.jpg', 300251, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(58, 2, 3, 'IMG-20250320-WA0046.jpg', 'IMG-20250320-WA0046.jpg', 'assets/Photos/March/IMG-20250320-WA0046.jpg', 297042, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(59, 2, 3, 'IMG-20250320-WA0047.jpg', 'IMG-20250320-WA0047.jpg', 'assets/Photos/March/IMG-20250320-WA0047.jpg', 238767, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(60, 2, 3, 'IMG-20250320-WA0048.jpg', 'IMG-20250320-WA0048.jpg', 'assets/Photos/March/IMG-20250320-WA0048.jpg', 235648, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(61, 2, 3, 'IMG-20250320-WA0049.jpg', 'IMG-20250320-WA0049.jpg', 'assets/Photos/March/IMG-20250320-WA0049.jpg', 316056, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(62, 2, 3, 'IMG-20250320-WA0050.jpg', 'IMG-20250320-WA0050.jpg', 'assets/Photos/March/IMG-20250320-WA0050.jpg', 276294, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(63, 2, 3, 'IMG-20250320-WA0051.jpg', 'IMG-20250320-WA0051.jpg', 'assets/Photos/March/IMG-20250320-WA0051.jpg', 246237, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(64, 2, 3, 'IMG-20250320-WA0052.jpg', 'IMG-20250320-WA0052.jpg', 'assets/Photos/March/IMG-20250320-WA0052.jpg', 295809, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(65, 2, 3, 'IMG-20250320-WA0053.jpg', 'IMG-20250320-WA0053.jpg', 'assets/Photos/March/IMG-20250320-WA0053.jpg', 277011, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(66, 2, 3, 'IMG-20250320-WA0054.jpg', 'IMG-20250320-WA0054.jpg', 'assets/Photos/March/IMG-20250320-WA0054.jpg', 235258, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(67, 2, 3, 'IMG-20250320-WA0055.jpg', 'IMG-20250320-WA0055.jpg', 'assets/Photos/March/IMG-20250320-WA0055.jpg', 336297, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(68, 2, 3, 'IMG-20250320-WA0056.jpg', 'IMG-20250320-WA0056.jpg', 'assets/Photos/March/IMG-20250320-WA0056.jpg', 212384, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(69, 2, 3, 'IMG-20250320-WA0057.jpg', 'IMG-20250320-WA0057.jpg', 'assets/Photos/March/IMG-20250320-WA0057.jpg', 326657, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(70, 2, 3, 'IMG-20250320-WA0058.jpg', 'IMG-20250320-WA0058.jpg', 'assets/Photos/March/IMG-20250320-WA0058.jpg', 303707, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(71, 2, 3, 'IMG-20250320-WA0059.jpg', 'IMG-20250320-WA0059.jpg', 'assets/Photos/March/IMG-20250320-WA0059.jpg', 301135, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(72, 2, 3, 'IMG-20250320-WA0060.jpg', 'IMG-20250320-WA0060.jpg', 'assets/Photos/March/IMG-20250320-WA0060.jpg', 302511, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(73, 2, 3, 'IMG-20250320-WA0061.jpg', 'IMG-20250320-WA0061.jpg', 'assets/Photos/March/IMG-20250320-WA0061.jpg', 231159, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(74, 2, 3, 'IMG-20250320-WA0062.jpg', 'IMG-20250320-WA0062.jpg', 'assets/Photos/March/IMG-20250320-WA0062.jpg', 279066, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(75, 2, 3, 'IMG-20250320-WA0063.jpg', 'IMG-20250320-WA0063.jpg', 'assets/Photos/March/IMG-20250320-WA0063.jpg', 243020, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(76, 2, 3, 'IMG-20250320-WA0064.jpg', 'IMG-20250320-WA0064.jpg', 'assets/Photos/March/IMG-20250320-WA0064.jpg', 244677, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(77, 2, 3, 'IMG-20250320-WA0065.jpg', 'IMG-20250320-WA0065.jpg', 'assets/Photos/March/IMG-20250320-WA0065.jpg', 369751, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(78, 2, 3, 'IMG-20250320-WA0066.jpg', 'IMG-20250320-WA0066.jpg', 'assets/Photos/March/IMG-20250320-WA0066.jpg', 393343, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(79, 2, 3, 'IMG-20250320-WA0067.jpg', 'IMG-20250320-WA0067.jpg', 'assets/Photos/March/IMG-20250320-WA0067.jpg', 372771, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(80, 2, 3, 'IMG-20250320-WA0068.jpg', 'IMG-20250320-WA0068.jpg', 'assets/Photos/March/IMG-20250320-WA0068.jpg', 97571, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(81, 2, 3, 'IMG-20250320-WA0069.jpg', 'IMG-20250320-WA0069.jpg', 'assets/Photos/March/IMG-20250320-WA0069.jpg', 244080, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(82, 2, 3, 'IMG-20250320-WA0070.jpg', 'IMG-20250320-WA0070.jpg', 'assets/Photos/March/IMG-20250320-WA0070.jpg', 245774, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(83, 2, 3, 'IMG-20250320-WA0071.jpg', 'IMG-20250320-WA0071.jpg', 'assets/Photos/March/IMG-20250320-WA0071.jpg', 142816, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(84, 2, 3, 'IMG-20250320-WA0072.jpg', 'IMG-20250320-WA0072.jpg', 'assets/Photos/March/IMG-20250320-WA0072.jpg', 273135, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(85, 2, 3, 'IMG-20250320-WA0073.jpg', 'IMG-20250320-WA0073.jpg', 'assets/Photos/March/IMG-20250320-WA0073.jpg', 172038, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(86, 2, 3, 'IMG-20250320-WA0074.jpg', 'IMG-20250320-WA0074.jpg', 'assets/Photos/March/IMG-20250320-WA0074.jpg', 272627, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(87, 2, 3, 'IMG-20250320-WA0075.jpg', 'IMG-20250320-WA0075.jpg', 'assets/Photos/March/IMG-20250320-WA0075.jpg', 271700, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(88, 2, 3, 'IMG-20250320-WA0076.jpg', 'IMG-20250320-WA0076.jpg', 'assets/Photos/March/IMG-20250320-WA0076.jpg', 273697, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(89, 2, 3, 'IMG-20250320-WA0077.jpg', 'IMG-20250320-WA0077.jpg', 'assets/Photos/March/IMG-20250320-WA0077.jpg', 311306, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(90, 2, 3, 'IMG-20250320-WA0078.jpg', 'IMG-20250320-WA0078.jpg', 'assets/Photos/March/IMG-20250320-WA0078.jpg', 286897, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(91, 2, 3, 'IMG-20250320-WA0103.jpg', 'IMG-20250320-WA0103.jpg', 'assets/Photos/March/IMG-20250320-WA0103.jpg', 373590, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(92, 2, 3, 'IMG-20250320-WA0104.jpg', 'IMG-20250320-WA0104.jpg', 'assets/Photos/March/IMG-20250320-WA0104.jpg', 365026, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(93, 2, 3, 'IMG-20250320-WA0105.jpg', 'IMG-20250320-WA0105.jpg', 'assets/Photos/March/IMG-20250320-WA0105.jpg', 475158, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(94, 2, 3, 'IMG-20250320-WA0106.jpg', 'IMG-20250320-WA0106.jpg', 'assets/Photos/March/IMG-20250320-WA0106.jpg', 444556, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(95, 2, 3, 'IMG-20250320-WA0107.jpg', 'IMG-20250320-WA0107.jpg', 'assets/Photos/March/IMG-20250320-WA0107.jpg', 243436, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(96, 2, 3, 'IMG-20250320-WA0108.jpg', 'IMG-20250320-WA0108.jpg', 'assets/Photos/March/IMG-20250320-WA0108.jpg', 409155, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(97, 2, 3, 'IMG-20250320-WA0110.jpg', 'IMG-20250320-WA0110.jpg', 'assets/Photos/March/IMG-20250320-WA0110.jpg', 289524, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(98, 2, 3, 'IMG-20250320-WA0112.jpg', 'IMG-20250320-WA0112.jpg', 'assets/Photos/March/IMG-20250320-WA0112.jpg', 221270, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(99, 2, 3, 'IMG-20250320-WA0113.jpg', 'IMG-20250320-WA0113.jpg', 'assets/Photos/March/IMG-20250320-WA0113.jpg', 313645, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(100, 2, 3, 'IMG-20250320-WA0114.jpg', 'IMG-20250320-WA0114.jpg', 'assets/Photos/March/IMG-20250320-WA0114.jpg', 200600, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(101, 2, 3, 'IMG-20250320-WA0116.jpg', 'IMG-20250320-WA0116.jpg', 'assets/Photos/March/IMG-20250320-WA0116.jpg', 227459, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(102, 2, 3, 'IMG-20250320-WA0117.jpg', 'IMG-20250320-WA0117.jpg', 'assets/Photos/March/IMG-20250320-WA0117.jpg', 330003, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(103, 2, 3, 'IMG-20250320-WA0118.jpg', 'IMG-20250320-WA0118.jpg', 'assets/Photos/March/IMG-20250320-WA0118.jpg', 241022, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(104, 2, 3, 'IMG-20250320-WA0119.jpg', 'IMG-20250320-WA0119.jpg', 'assets/Photos/March/IMG-20250320-WA0119.jpg', 213758, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(105, 2, 3, 'IMG-20250320-WA0120.jpg', 'IMG-20250320-WA0120.jpg', 'assets/Photos/March/IMG-20250320-WA0120.jpg', 333486, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(106, 2, 3, 'IMG-20250320-WA0121.jpg', 'IMG-20250320-WA0121.jpg', 'assets/Photos/March/IMG-20250320-WA0121.jpg', 106260, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(107, 2, 3, 'IMG-20250320-WA0122.jpg', 'IMG-20250320-WA0122.jpg', 'assets/Photos/March/IMG-20250320-WA0122.jpg', 110818, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:53', '2025-10-22 17:23:37'),
(108, 2, 3, 'IMG-20250320-WA0123.jpg', 'IMG-20250320-WA0123.jpg', 'assets/Photos/March/IMG-20250320-WA0123.jpg', 103603, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(109, 2, 3, 'IMG-20250320-WA0124.jpg', 'IMG-20250320-WA0124.jpg', 'assets/Photos/March/IMG-20250320-WA0124.jpg', 86856, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(110, 2, 3, 'IMG-20250320-WA0125.jpg', 'IMG-20250320-WA0125.jpg', 'assets/Photos/March/IMG-20250320-WA0125.jpg', 100686, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(111, 2, 3, 'IMG-20250320-WA0126.jpg', 'IMG-20250320-WA0126.jpg', 'assets/Photos/March/IMG-20250320-WA0126.jpg', 102527, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-15', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(112, 2, 3, 'WhatsApp Image 2025-03-20 at 13.57.34_b92c3fba.jpg', 'WhatsApp Image 2025-03-20 at 13.57.34_b92c3fba.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 13.57.34_b92c3fba.jpg', 172305, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(113, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.29_a3153d60.jpg', 'WhatsApp Image 2025-03-20 at 14.01.29_a3153d60.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.29_a3153d60.jpg', 144182, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(114, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.30_2e40ad5a.jpg', 'WhatsApp Image 2025-03-20 at 14.01.30_2e40ad5a.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.30_2e40ad5a.jpg', 172305, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(115, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.30_35a2b392.jpg', 'WhatsApp Image 2025-03-20 at 14.01.30_35a2b392.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.30_35a2b392.jpg', 285849, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(116, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.30_45c36c45.jpg', 'WhatsApp Image 2025-03-20 at 14.01.30_45c36c45.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.30_45c36c45.jpg', 86164, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(117, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.30_6deb4695.jpg', 'WhatsApp Image 2025-03-20 at 14.01.30_6deb4695.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.30_6deb4695.jpg', 268156, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(118, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.32_0198b92f.jpg', 'WhatsApp Image 2025-03-20 at 14.01.32_0198b92f.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.32_0198b92f.jpg', 258944, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(119, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.32_165eda0a.jpg', 'WhatsApp Image 2025-03-20 at 14.01.32_165eda0a.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.32_165eda0a.jpg', 70059, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(120, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.32_282b4a3b.jpg', 'WhatsApp Image 2025-03-20 at 14.01.32_282b4a3b.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.32_282b4a3b.jpg', 160281, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(121, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.32_384a33ed.jpg', 'WhatsApp Image 2025-03-20 at 14.01.32_384a33ed.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.32_384a33ed.jpg', 334739, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(122, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.32_38ab2d36.jpg', 'WhatsApp Image 2025-03-20 at 14.01.32_38ab2d36.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.32_38ab2d36.jpg', 243928, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(123, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.32_3abacf17.jpg', 'WhatsApp Image 2025-03-20 at 14.01.32_3abacf17.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.32_3abacf17.jpg', 123761, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(124, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.32_7791b0fb.jpg', 'WhatsApp Image 2025-03-20 at 14.01.32_7791b0fb.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.32_7791b0fb.jpg', 148635, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(125, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.32_b839171b.jpg', 'WhatsApp Image 2025-03-20 at 14.01.32_b839171b.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.32_b839171b.jpg', 425247, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(126, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.32_d58ac305.jpg', 'WhatsApp Image 2025-03-20 at 14.01.32_d58ac305.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.32_d58ac305.jpg', 163137, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(127, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.34_2a0aae7c.jpg', 'WhatsApp Image 2025-03-20 at 14.01.34_2a0aae7c.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.34_2a0aae7c.jpg', 139291, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(128, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.34_47415e9d.jpg', 'WhatsApp Image 2025-03-20 at 14.01.34_47415e9d.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.34_47415e9d.jpg', 250552, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(129, 2, 3, 'WhatsApp Image 2025-03-20 at 14.01.34_af09b6fb.jpg', 'WhatsApp Image 2025-03-20 at 14.01.34_af09b6fb.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.01.34_af09b6fb.jpg', 228066, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(130, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.08_1303511e.jpg', 'WhatsApp Image 2025-03-20 at 14.02.08_1303511e.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.08_1303511e.jpg', 395233, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(131, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.09_63d6313d.jpg', 'WhatsApp Image 2025-03-20 at 14.02.09_63d6313d.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.09_63d6313d.jpg', 463396, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(132, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.10_2f4f01cc.jpg', 'WhatsApp Image 2025-03-20 at 14.02.10_2f4f01cc.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.10_2f4f01cc.jpg', 472996, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(133, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.15_efe3af05.jpg', 'WhatsApp Image 2025-03-20 at 14.02.15_efe3af05.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.15_efe3af05.jpg', 241022, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(134, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.16_ad5941d8.jpg', 'WhatsApp Image 2025-03-20 at 14.02.16_ad5941d8.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.16_ad5941d8.jpg', 213758, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(135, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.17_189c71aa.jpg', 'WhatsApp Image 2025-03-20 at 14.02.17_189c71aa.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.17_189c71aa.jpg', 333486, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(136, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.18_225135eb.jpg', 'WhatsApp Image 2025-03-20 at 14.02.18_225135eb.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.18_225135eb.jpg', 106260, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(137, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.18_eaf26a21.jpg', 'WhatsApp Image 2025-03-20 at 14.02.18_eaf26a21.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.18_eaf26a21.jpg', 110818, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(138, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.19_07856d8e.jpg', 'WhatsApp Image 2025-03-20 at 14.02.19_07856d8e.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.19_07856d8e.jpg', 86856, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(139, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.19_3a0fb7db.jpg', 'WhatsApp Image 2025-03-20 at 14.02.19_3a0fb7db.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.19_3a0fb7db.jpg', 100686, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(140, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.19_6c877ac9.jpg', 'WhatsApp Image 2025-03-20 at 14.02.19_6c877ac9.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.19_6c877ac9.jpg', 103603, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(141, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.20_049ef589.jpg', 'WhatsApp Image 2025-03-20 at 14.02.20_049ef589.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.20_049ef589.jpg', 136707, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(142, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.20_17d461cb.jpg', 'WhatsApp Image 2025-03-20 at 14.02.20_17d461cb.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.20_17d461cb.jpg', 86164, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(143, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.20_1e9aeb4b.jpg', 'WhatsApp Image 2025-03-20 at 14.02.20_1e9aeb4b.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.20_1e9aeb4b.jpg', 248257, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(144, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.20_75603992.jpg', 'WhatsApp Image 2025-03-20 at 14.02.20_75603992.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.20_75603992.jpg', 262656, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(145, 2, 3, 'WhatsApp Image 2025-03-20 at 14.02.20_f8993961.jpg', 'WhatsApp Image 2025-03-20 at 14.02.20_f8993961.jpg', 'assets/Photos/March/WhatsApp Image 2025-03-20 at 14.02.20_f8993961.jpg', 102527, 'image/jpeg', 'Construction Photo - March', 'Photo from March construction activities', 'Structural Work', '2025-03-20', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(146, 2, 3, 'PHOTO-2025-04-29-17-09-23 2.JPG', 'PHOTO-2025-04-29-17-09-23 2.JPG', 'assets/Photos/April/PHOTO-2025-04-29-17-09-23 2.JPG', 222848, 'image/jpeg', 'Construction Photo - April', 'Photo from April construction activities', 'Walls', '2025-04-29', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(147, 2, 3, 'PHOTO-2025-04-29-17-09-23 4.JPG', 'PHOTO-2025-04-29-17-09-23 4.JPG', 'assets/Photos/April/PHOTO-2025-04-29-17-09-23 4.JPG', 194959, 'image/jpeg', 'Construction Photo - April', 'Photo from April construction activities', 'Walls', '2025-04-29', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(148, 2, 3, 'PHOTO-2025-04-29-17-09-23.JPG', 'PHOTO-2025-04-29-17-09-23.JPG', 'assets/Photos/April/PHOTO-2025-04-29-17-09-23.JPG', 224008, 'image/jpeg', 'Construction Photo - April', 'Photo from April construction activities', 'Walls', '2025-04-29', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(149, 2, 3, 'PHOTO-2025-04-29-18-23-35.JPG', 'PHOTO-2025-04-29-18-23-35.JPG', 'assets/Photos/April/PHOTO-2025-04-29-18-23-35.JPG', 195093, 'image/jpeg', 'Construction Photo - April', 'Photo from April construction activities', 'Walls', '2025-04-29', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(150, 2, 3, 'PHOTO-2025-04-29-18-23-36.JPG', 'PHOTO-2025-04-29-18-23-36.JPG', 'assets/Photos/April/PHOTO-2025-04-29-18-23-36.JPG', 137495, 'image/jpeg', 'Construction Photo - April', 'Photo from April construction activities', 'Walls', '2025-04-29', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(151, 2, 3, 'PHOTO-2025-04-29-18-23-37.JPG', 'PHOTO-2025-04-29-18-23-37.JPG', 'assets/Photos/April/PHOTO-2025-04-29-18-23-37.JPG', 194527, 'image/jpeg', 'Construction Photo - April', 'Photo from April construction activities', 'Walls', '2025-04-29', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(152, 2, 3, 'PHOTO-2025-04-29-18-23-38 2.JPG', 'PHOTO-2025-04-29-18-23-38 2.JPG', 'assets/Photos/April/PHOTO-2025-04-29-18-23-38 2.JPG', 187747, 'image/jpeg', 'Construction Photo - April', 'Photo from April construction activities', 'Walls', '2025-04-29', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(153, 2, 3, 'PHOTO-2025-04-29-18-23-38.JPG', 'PHOTO-2025-04-29-18-23-38.JPG', 'assets/Photos/April/PHOTO-2025-04-29-18-23-38.JPG', 180457, 'image/jpeg', 'Construction Photo - April', 'Photo from April construction activities', 'Walls', '2025-04-29', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(154, 2, 3, 'PHOTO-2025-04-29-18-34-22 2.JPG', 'PHOTO-2025-04-29-18-34-22 2.JPG', 'assets/Photos/April/PHOTO-2025-04-29-18-34-22 2.JPG', 61004, 'image/jpeg', 'Construction Photo - April', 'Photo from April construction activities', 'Walls', '2025-04-29', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(155, 2, 3, 'PHOTO-2025-04-29-18-34-22.JPG', 'PHOTO-2025-04-29-18-34-22.JPG', 'assets/Photos/April/PHOTO-2025-04-29-18-34-22.JPG', 57705, 'image/jpeg', 'Construction Photo - April', 'Photo from April construction activities', 'Walls', '2025-04-29', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37');
INSERT INTO `photos` (`id`, `project_id`, `user_id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `title`, `description`, `category`, `photo_date`, `is_featured`, `created_at`, `updated_at`) VALUES
(156, 2, 3, 'PHOTO-2025-04-09-10-49-54 2.JPG', 'PHOTO-2025-04-09-10-49-54 2.JPG', 'assets/Photos/May/PHOTO-2025-04-09-10-49-54 2.JPG', 81587, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-09', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(157, 2, 3, 'PHOTO-2025-04-09-10-49-54.JPG', 'PHOTO-2025-04-09-10-49-54.JPG', 'assets/Photos/May/PHOTO-2025-04-09-10-49-54.JPG', 86164, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-09', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(158, 2, 3, 'PHOTO-2025-04-09-11-50-04.JPG', 'PHOTO-2025-04-09-11-50-04.JPG', 'assets/Photos/May/PHOTO-2025-04-09-11-50-04.JPG', 82302, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-09', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(159, 2, 3, 'PHOTO-2025-04-09-11-50-05.JPG', 'PHOTO-2025-04-09-11-50-05.JPG', 'assets/Photos/May/PHOTO-2025-04-09-11-50-05.JPG', 96454, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-09', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(160, 2, 3, 'PHOTO-2025-04-09-20-49-38.JPG', 'PHOTO-2025-04-09-20-49-38.JPG', 'assets/Photos/May/PHOTO-2025-04-09-20-49-38.JPG', 150540, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-09', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(161, 2, 3, 'PHOTO-2025-04-09-20-50-24.JPG', 'PHOTO-2025-04-09-20-50-24.JPG', 'assets/Photos/May/PHOTO-2025-04-09-20-50-24.JPG', 155592, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-09', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(162, 2, 3, 'PHOTO-2025-04-09-20-50-45.JPG', 'PHOTO-2025-04-09-20-50-45.JPG', 'assets/Photos/May/PHOTO-2025-04-09-20-50-45.JPG', 148029, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-09', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(163, 2, 3, 'PHOTO-2025-04-11-20-17-30 2.JPG', 'PHOTO-2025-04-11-20-17-30 2.JPG', 'assets/Photos/May/PHOTO-2025-04-11-20-17-30 2.JPG', 159254, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-11', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(164, 2, 3, 'PHOTO-2025-04-11-20-17-30.JPG', 'PHOTO-2025-04-11-20-17-30.JPG', 'assets/Photos/May/PHOTO-2025-04-11-20-17-30.JPG', 113272, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-11', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(165, 2, 3, 'PHOTO-2025-04-11-20-17-31.JPG', 'PHOTO-2025-04-11-20-17-31.JPG', 'assets/Photos/May/PHOTO-2025-04-11-20-17-31.JPG', 146244, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-11', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(166, 2, 3, 'PHOTO-2025-04-11-20-17-32 2.JPG', 'PHOTO-2025-04-11-20-17-32 2.JPG', 'assets/Photos/May/PHOTO-2025-04-11-20-17-32 2.JPG', 160162, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-11', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(167, 2, 3, 'PHOTO-2025-04-11-20-17-32.JPG', 'PHOTO-2025-04-11-20-17-32.JPG', 'assets/Photos/May/PHOTO-2025-04-11-20-17-32.JPG', 177094, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-11', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(168, 2, 3, 'PHOTO-2025-04-13-01-37-12.JPG', 'PHOTO-2025-04-13-01-37-12.JPG', 'assets/Photos/May/PHOTO-2025-04-13-01-37-12.JPG', 313517, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-13', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(169, 2, 3, 'PHOTO-2025-04-13-01-37-15.JPG', 'PHOTO-2025-04-13-01-37-15.JPG', 'assets/Photos/May/PHOTO-2025-04-13-01-37-15.JPG', 253752, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-13', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(170, 2, 3, 'PHOTO-2025-04-13-01-37-16.JPG', 'PHOTO-2025-04-13-01-37-16.JPG', 'assets/Photos/May/PHOTO-2025-04-13-01-37-16.JPG', 267387, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-13', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(171, 2, 3, 'PHOTO-2025-04-13-01-37-17.JPG', 'PHOTO-2025-04-13-01-37-17.JPG', 'assets/Photos/May/PHOTO-2025-04-13-01-37-17.JPG', 250265, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-13', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(172, 2, 3, 'PHOTO-2025-04-13-01-37-18.JPG', 'PHOTO-2025-04-13-01-37-18.JPG', 'assets/Photos/May/PHOTO-2025-04-13-01-37-18.JPG', 297571, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-13', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(173, 2, 3, 'PHOTO-2025-04-14-19-25-40.JPG', 'PHOTO-2025-04-14-19-25-40.JPG', 'assets/Photos/May/PHOTO-2025-04-14-19-25-40.JPG', 180887, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-14', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(174, 2, 3, 'PHOTO-2025-04-14-19-25-48.JPG', 'PHOTO-2025-04-14-19-25-48.JPG', 'assets/Photos/May/PHOTO-2025-04-14-19-25-48.JPG', 128904, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-14', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(175, 2, 3, 'PHOTO-2025-04-14-19-25-52.JPG', 'PHOTO-2025-04-14-19-25-52.JPG', 'assets/Photos/May/PHOTO-2025-04-14-19-25-52.JPG', 108673, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-14', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(176, 2, 3, 'PHOTO-2025-04-15-18-45-18.JPG', 'PHOTO-2025-04-15-18-45-18.JPG', 'assets/Photos/May/PHOTO-2025-04-15-18-45-18.JPG', 188639, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-15', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(177, 2, 3, 'PHOTO-2025-04-15-18-45-19 2.JPG', 'PHOTO-2025-04-15-18-45-19 2.JPG', 'assets/Photos/May/PHOTO-2025-04-15-18-45-19 2.JPG', 220012, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-15', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(178, 2, 3, 'PHOTO-2025-04-15-18-45-19 3.JPG', 'PHOTO-2025-04-15-18-45-19 3.JPG', 'assets/Photos/May/PHOTO-2025-04-15-18-45-19 3.JPG', 160562, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-15', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(179, 2, 3, 'PHOTO-2025-04-15-18-45-19.JPG', 'PHOTO-2025-04-15-18-45-19.JPG', 'assets/Photos/May/PHOTO-2025-04-15-18-45-19.JPG', 173020, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-15', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(180, 2, 3, 'PHOTO-2025-04-17-07-31-39.JPG', 'PHOTO-2025-04-17-07-31-39.JPG', 'assets/Photos/May/PHOTO-2025-04-17-07-31-39.JPG', 121281, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-17', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(181, 2, 3, 'PHOTO-2025-04-17-07-31-55.JPG', 'PHOTO-2025-04-17-07-31-55.JPG', 'assets/Photos/May/PHOTO-2025-04-17-07-31-55.JPG', 297147, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-17', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(182, 2, 3, 'PHOTO-2025-04-18-21-37-37 2.JPG', 'PHOTO-2025-04-18-21-37-37 2.JPG', 'assets/Photos/May/PHOTO-2025-04-18-21-37-37 2.JPG', 147878, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-18', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(183, 2, 3, 'PHOTO-2025-04-18-21-37-37.JPG', 'PHOTO-2025-04-18-21-37-37.JPG', 'assets/Photos/May/PHOTO-2025-04-18-21-37-37.JPG', 162772, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-18', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(184, 2, 3, 'PHOTO-2025-04-18-21-37-42.JPG', 'PHOTO-2025-04-18-21-37-42.JPG', 'assets/Photos/May/PHOTO-2025-04-18-21-37-42.JPG', 75297, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-18', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(185, 2, 3, 'PHOTO-2025-04-18-21-37-44 2.JPG', 'PHOTO-2025-04-18-21-37-44 2.JPG', 'assets/Photos/May/PHOTO-2025-04-18-21-37-44 2.JPG', 194420, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-18', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(186, 2, 3, 'PHOTO-2025-04-18-21-37-44.JPG', 'PHOTO-2025-04-18-21-37-44.JPG', 'assets/Photos/May/PHOTO-2025-04-18-21-37-44.JPG', 196261, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-18', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(187, 2, 3, 'PHOTO-2025-04-18-21-37-45.JPG', 'PHOTO-2025-04-18-21-37-45.JPG', 'assets/Photos/May/PHOTO-2025-04-18-21-37-45.JPG', 169406, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-18', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(188, 2, 3, 'PHOTO-2025-04-19-12-35-48.JPG', 'PHOTO-2025-04-19-12-35-48.JPG', 'assets/Photos/May/PHOTO-2025-04-19-12-35-48.JPG', 147864, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-19', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(189, 2, 3, 'PHOTO-2025-04-24-16-51-10 2.JPG', 'PHOTO-2025-04-24-16-51-10 2.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-10 2.JPG', 149583, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(190, 2, 3, 'PHOTO-2025-04-24-16-51-10 3.JPG', 'PHOTO-2025-04-24-16-51-10 3.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-10 3.JPG', 206973, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(191, 2, 3, 'PHOTO-2025-04-24-16-51-10 4.JPG', 'PHOTO-2025-04-24-16-51-10 4.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-10 4.JPG', 345567, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(192, 2, 3, 'PHOTO-2025-04-24-16-51-11 2.JPG', 'PHOTO-2025-04-24-16-51-11 2.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-11 2.JPG', 153566, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(193, 2, 3, 'PHOTO-2025-04-24-16-51-11 3.JPG', 'PHOTO-2025-04-24-16-51-11 3.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-11 3.JPG', 47663, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(194, 2, 3, 'PHOTO-2025-04-24-16-51-11 4.JPG', 'PHOTO-2025-04-24-16-51-11 4.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-11 4.JPG', 293627, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(195, 2, 3, 'PHOTO-2025-04-24-16-51-11 5.JPG', 'PHOTO-2025-04-24-16-51-11 5.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-11 5.JPG', 73959, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(196, 2, 3, 'PHOTO-2025-04-24-16-51-11 6.JPG', 'PHOTO-2025-04-24-16-51-11 6.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-11 6.JPG', 314238, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(197, 2, 3, 'PHOTO-2025-04-24-16-51-11 7.JPG', 'PHOTO-2025-04-24-16-51-11 7.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-11 7.JPG', 371569, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(198, 2, 3, 'PHOTO-2025-04-24-16-51-11.JPG', 'PHOTO-2025-04-24-16-51-11.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-11.JPG', 101150, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(199, 2, 3, 'PHOTO-2025-04-24-16-51-12 2.JPG', 'PHOTO-2025-04-24-16-51-12 2.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-12 2.JPG', 354919, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(200, 2, 3, 'PHOTO-2025-04-24-16-51-12 3.JPG', 'PHOTO-2025-04-24-16-51-12 3.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-12 3.JPG', 336734, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(201, 2, 3, 'PHOTO-2025-04-24-16-51-12 4.JPG', 'PHOTO-2025-04-24-16-51-12 4.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-12 4.JPG', 296071, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(202, 2, 3, 'PHOTO-2025-04-24-16-51-12 5.JPG', 'PHOTO-2025-04-24-16-51-12 5.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-12 5.JPG', 293193, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(203, 2, 3, 'PHOTO-2025-04-24-16-51-12 6.JPG', 'PHOTO-2025-04-24-16-51-12 6.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-12 6.JPG', 404101, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(204, 2, 3, 'PHOTO-2025-04-24-16-51-12 7.JPG', 'PHOTO-2025-04-24-16-51-12 7.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-12 7.JPG', 266748, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(205, 2, 3, 'PHOTO-2025-04-24-16-51-12 8.JPG', 'PHOTO-2025-04-24-16-51-12 8.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-12 8.JPG', 294997, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(206, 2, 3, 'PHOTO-2025-04-24-16-51-12.JPG', 'PHOTO-2025-04-24-16-51-12.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-12.JPG', 347968, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:54', '2025-10-22 17:23:37'),
(207, 2, 3, 'PHOTO-2025-04-24-16-51-13 2.JPG', 'PHOTO-2025-04-24-16-51-13 2.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-13 2.JPG', 273080, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(208, 2, 3, 'PHOTO-2025-04-24-16-51-13 3.JPG', 'PHOTO-2025-04-24-16-51-13 3.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-13 3.JPG', 271052, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(209, 2, 3, 'PHOTO-2025-04-24-16-51-13 4.JPG', 'PHOTO-2025-04-24-16-51-13 4.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-13 4.JPG', 259601, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(210, 2, 3, 'PHOTO-2025-04-24-16-51-13 5.JPG', 'PHOTO-2025-04-24-16-51-13 5.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-13 5.JPG', 220615, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(211, 2, 3, 'PHOTO-2025-04-24-16-51-13.JPG', 'PHOTO-2025-04-24-16-51-13.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-13.JPG', 234825, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(212, 2, 3, 'PHOTO-2025-04-24-16-51-14 2.JPG', 'PHOTO-2025-04-24-16-51-14 2.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-14 2.JPG', 179841, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(213, 2, 3, 'PHOTO-2025-04-24-16-51-14 3.JPG', 'PHOTO-2025-04-24-16-51-14 3.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-14 3.JPG', 225349, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(214, 2, 3, 'PHOTO-2025-04-24-16-51-14.JPG', 'PHOTO-2025-04-24-16-51-14.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-14.JPG', 211325, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(215, 2, 3, 'PHOTO-2025-04-24-16-51-16 2.JPG', 'PHOTO-2025-04-24-16-51-16 2.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-16 2.JPG', 206217, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(216, 2, 3, 'PHOTO-2025-04-24-16-51-16 3.JPG', 'PHOTO-2025-04-24-16-51-16 3.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-16 3.JPG', 163649, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(217, 2, 3, 'PHOTO-2025-04-24-16-51-16.JPG', 'PHOTO-2025-04-24-16-51-16.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-16.JPG', 159385, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(218, 2, 3, 'PHOTO-2025-04-24-16-51-19.JPG', 'PHOTO-2025-04-24-16-51-19.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-19.JPG', 228695, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(219, 2, 3, 'PHOTO-2025-04-24-16-51-20 2.JPG', 'PHOTO-2025-04-24-16-51-20 2.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-20 2.JPG', 176946, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(220, 2, 3, 'PHOTO-2025-04-24-16-51-20 3.JPG', 'PHOTO-2025-04-24-16-51-20 3.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-20 3.JPG', 204763, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(221, 2, 3, 'PHOTO-2025-04-24-16-51-20 4.JPG', 'PHOTO-2025-04-24-16-51-20 4.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-20 4.JPG', 191721, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(222, 2, 3, 'PHOTO-2025-04-24-16-51-20 5.JPG', 'PHOTO-2025-04-24-16-51-20 5.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-20 5.JPG', 205036, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(223, 2, 3, 'PHOTO-2025-04-24-16-51-20 6.JPG', 'PHOTO-2025-04-24-16-51-20 6.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-20 6.JPG', 206517, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(224, 2, 3, 'PHOTO-2025-04-24-16-51-20 7.JPG', 'PHOTO-2025-04-24-16-51-20 7.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-20 7.JPG', 185179, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(225, 2, 3, 'PHOTO-2025-04-24-16-51-20.JPG', 'PHOTO-2025-04-24-16-51-20.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-20.JPG', 217689, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(226, 2, 3, 'PHOTO-2025-04-24-16-51-21 2.JPG', 'PHOTO-2025-04-24-16-51-21 2.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-21 2.JPG', 225199, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(227, 2, 3, 'PHOTO-2025-04-24-16-51-21 3.JPG', 'PHOTO-2025-04-24-16-51-21 3.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-21 3.JPG', 203574, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(228, 2, 3, 'PHOTO-2025-04-24-16-51-21 4.JPG', 'PHOTO-2025-04-24-16-51-21 4.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-21 4.JPG', 237928, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(229, 2, 3, 'PHOTO-2025-04-24-16-51-21 5.JPG', 'PHOTO-2025-04-24-16-51-21 5.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-21 5.JPG', 211553, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(230, 2, 3, 'PHOTO-2025-04-24-16-51-21.JPG', 'PHOTO-2025-04-24-16-51-21.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-21.JPG', 176620, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(231, 2, 3, 'PHOTO-2025-04-24-16-51-24 2.JPG', 'PHOTO-2025-04-24-16-51-24 2.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-24 2.JPG', 212815, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(232, 2, 3, 'PHOTO-2025-04-24-16-51-24 3.JPG', 'PHOTO-2025-04-24-16-51-24 3.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-24 3.JPG', 201406, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(233, 2, 3, 'PHOTO-2025-04-24-16-51-24.JPG', 'PHOTO-2025-04-24-16-51-24.JPG', 'assets/Photos/May/PHOTO-2025-04-24-16-51-24.JPG', 205930, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-24', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(234, 2, 3, 'PHOTO-2025-04-29-17-09-23 3.JPG', 'PHOTO-2025-04-29-17-09-23 3.JPG', 'assets/Photos/May/PHOTO-2025-04-29-17-09-23 3.JPG', 270456, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-04-29', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(235, 2, 3, 'PHOTO-2025-05-01-19-32-12.JPG', 'PHOTO-2025-05-01-19-32-12.JPG', 'assets/Photos/May/PHOTO-2025-05-01-19-32-12.JPG', 145817, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-05-01', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(236, 2, 3, 'PHOTO-2025-05-01-19-32-29.JPG', 'PHOTO-2025-05-01-19-32-29.JPG', 'assets/Photos/May/PHOTO-2025-05-01-19-32-29.JPG', 123177, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-05-01', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(237, 2, 3, 'PHOTO-2025-05-01-19-33-26.JPG', 'PHOTO-2025-05-01-19-33-26.JPG', 'assets/Photos/May/PHOTO-2025-05-01-19-33-26.JPG', 155254, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-05-01', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(238, 2, 3, 'PHOTO-2025-05-01-19-36-32.JPG', 'PHOTO-2025-05-01-19-36-32.JPG', 'assets/Photos/May/PHOTO-2025-05-01-19-36-32.JPG', 141305, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-05-01', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(239, 2, 3, 'PHOTO-2025-05-01-19-36-54.JPG', 'PHOTO-2025-05-01-19-36-54.JPG', 'assets/Photos/May/PHOTO-2025-05-01-19-36-54.JPG', 134005, 'image/jpeg', 'Construction Photo - May', 'Photo from May construction activities', 'Roofing', '2025-05-01', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(240, 2, 3, 'IMG-20250914-WA0014.jpg', 'IMG-20250914-WA0014.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250914-WA0014.jpg', 95631, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(241, 2, 3, 'IMG-20250914-WA0015.jpg', 'IMG-20250914-WA0015.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250914-WA0015.jpg', 78409, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(242, 2, 3, 'IMG-20250914-WA0016.jpg', 'IMG-20250914-WA0016.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250914-WA0016.jpg', 82863, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(243, 2, 3, 'IMG-20250914-WA0017.jpg', 'IMG-20250914-WA0017.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250914-WA0017.jpg', 91218, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(244, 2, 3, 'IMG-20250914-WA0018.jpg', 'IMG-20250914-WA0018.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250914-WA0018.jpg', 82833, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(245, 2, 3, 'IMG-20250926-WA0001.jpg', 'IMG-20250926-WA0001.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0001.jpg', 104470, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(246, 2, 3, 'IMG-20250926-WA0002.jpg', 'IMG-20250926-WA0002.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0002.jpg', 109479, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(247, 2, 3, 'IMG-20250926-WA0003.jpg', 'IMG-20250926-WA0003.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0003.jpg', 106220, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(248, 2, 3, 'IMG-20250926-WA0004.jpg', 'IMG-20250926-WA0004.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0004.jpg', 151786, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(249, 2, 3, 'IMG-20250926-WA0005.jpg', 'IMG-20250926-WA0005.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0005.jpg', 121952, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(250, 2, 3, 'IMG-20250926-WA0006.jpg', 'IMG-20250926-WA0006.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0006.jpg', 162057, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(251, 2, 3, 'IMG-20250926-WA0007.jpg', 'IMG-20250926-WA0007.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0007.jpg', 88132, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(252, 2, 3, 'IMG-20250926-WA0008.jpg', 'IMG-20250926-WA0008.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0008.jpg', 94354, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(253, 2, 3, 'IMG-20250926-WA0009.jpg', 'IMG-20250926-WA0009.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0009.jpg', 89887, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(254, 2, 3, 'IMG-20250926-WA0010.jpg', 'IMG-20250926-WA0010.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0010.jpg', 69958, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(255, 2, 3, 'IMG-20250926-WA0011.jpg', 'IMG-20250926-WA0011.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0011.jpg', 102274, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(256, 2, 3, 'IMG-20250926-WA0012.jpg', 'IMG-20250926-WA0012.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0012.jpg', 104246, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(257, 2, 3, 'IMG-20250926-WA0013.jpg', 'IMG-20250926-WA0013.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0013.jpg', 91727, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(258, 2, 3, 'IMG-20250926-WA0014.jpg', 'IMG-20250926-WA0014.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0014.jpg', 106843, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(259, 2, 3, 'IMG-20250926-WA0015.jpg', 'IMG-20250926-WA0015.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0015.jpg', 197654, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(260, 2, 3, 'IMG-20250926-WA0016.jpg', 'IMG-20250926-WA0016.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0016.jpg', 240952, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(261, 2, 3, 'IMG-20250926-WA0017.jpg', 'IMG-20250926-WA0017.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0017.jpg', 240676, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(262, 2, 3, 'IMG-20250926-WA0018.jpg', 'IMG-20250926-WA0018.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0018.jpg', 283226, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(263, 2, 3, 'IMG-20250926-WA0019.jpg', 'IMG-20250926-WA0019.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0019.jpg', 184351, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(264, 2, 3, 'IMG-20250926-WA0020.jpg', 'IMG-20250926-WA0020.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0020.jpg', 152182, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(265, 2, 3, 'IMG-20250926-WA0021.jpg', 'IMG-20250926-WA0021.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0021.jpg', 150431, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(266, 2, 3, 'IMG-20250926-WA0022.jpg', 'IMG-20250926-WA0022.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0022.jpg', 143799, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(267, 2, 3, 'IMG-20250926-WA0023.jpg', 'IMG-20250926-WA0023.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0023.jpg', 150920, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(268, 2, 3, 'IMG-20250926-WA0024.jpg', 'IMG-20250926-WA0024.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0024.jpg', 172997, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(269, 2, 3, 'IMG-20250926-WA0025.jpg', 'IMG-20250926-WA0025.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0025.jpg', 286683, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(270, 2, 3, 'IMG-20250926-WA0027.jpg', 'IMG-20250926-WA0027.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0027.jpg', 64915, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(271, 2, 3, 'IMG-20250926-WA0028.jpg', 'IMG-20250926-WA0028.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0028.jpg', 62685, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(272, 2, 3, 'IMG-20250926-WA0029.jpg', 'IMG-20250926-WA0029.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0029.jpg', 81836, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(273, 2, 3, 'IMG-20250926-WA0030.jpg', 'IMG-20250926-WA0030.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0030.jpg', 66793, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(274, 2, 3, 'IMG-20250926-WA0032.jpg', 'IMG-20250926-WA0032.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/IMG-20250926-WA0032.jpg', 58644, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(275, 2, 3, 'WhatsApp Image 2025-09-25 at 19.19.32_904c8e47.jpg', 'WhatsApp Image 2025-09-25 at 19.19.32_904c8e47.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/WhatsApp Image 2025-09-25 at 19.19.32_904c8e47.jpg', 157732, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-09-25', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(276, 2, 3, 'WhatsApp Image 2025-09-25 at 19.19.32_94390bab.jpg', 'WhatsApp Image 2025-09-25 at 19.19.32_94390bab.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-25/WhatsApp Image 2025-09-25 at 19.19.32_94390bab.jpg', 183372, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-09-25', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(277, 2, 3, 'IMG-20250927-WA0001.jpg', 'IMG-20250927-WA0001.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0001.jpg', 459582, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(278, 2, 3, 'IMG-20250927-WA0002.jpg', 'IMG-20250927-WA0002.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0002.jpg', 373870, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(279, 2, 3, 'IMG-20250927-WA0003.jpg', 'IMG-20250927-WA0003.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0003.jpg', 441228, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(280, 2, 3, 'IMG-20250927-WA0004.jpg', 'IMG-20250927-WA0004.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0004.jpg', 417307, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(281, 2, 3, 'IMG-20250927-WA0005.jpg', 'IMG-20250927-WA0005.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0005.jpg', 394765, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(282, 2, 3, 'IMG-20250927-WA0006.jpg', 'IMG-20250927-WA0006.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0006.jpg', 309640, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(283, 2, 3, 'IMG-20250927-WA0007.jpg', 'IMG-20250927-WA0007.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0007.jpg', 522418, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(284, 2, 3, 'IMG-20250927-WA0008.jpg', 'IMG-20250927-WA0008.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0008.jpg', 532624, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(285, 2, 3, 'IMG-20250927-WA0009.jpg', 'IMG-20250927-WA0009.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0009.jpg', 428508, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(286, 2, 3, 'IMG-20250927-WA0010.jpg', 'IMG-20250927-WA0010.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0010.jpg', 675418, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(287, 2, 3, 'IMG-20250927-WA0011.jpg', 'IMG-20250927-WA0011.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0011.jpg', 637635, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(288, 2, 3, 'IMG-20250927-WA0012.jpg', 'IMG-20250927-WA0012.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0012.jpg', 383271, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(289, 2, 3, 'IMG-20250927-WA0013.jpg', 'IMG-20250927-WA0013.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0013.jpg', 590429, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(290, 2, 3, 'IMG-20250927-WA0014.jpg', 'IMG-20250927-WA0014.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0014.jpg', 592842, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(291, 2, 3, 'IMG-20250927-WA0015.jpg', 'IMG-20250927-WA0015.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0015.jpg', 398230, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(292, 2, 3, 'IMG-20250927-WA0016.jpg', 'IMG-20250927-WA0016.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0016.jpg', 423008, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:55', '2025-10-22 17:23:37'),
(293, 2, 3, 'IMG-20250927-WA0017.jpg', 'IMG-20250927-WA0017.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0017.jpg', 587057, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(294, 2, 3, 'IMG-20250927-WA0018.jpg', 'IMG-20250927-WA0018.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0018.jpg', 203438, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(295, 2, 3, 'IMG-20250927-WA0019.jpg', 'IMG-20250927-WA0019.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0019.jpg', 402583, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(296, 2, 3, 'IMG-20250927-WA0020.jpg', 'IMG-20250927-WA0020.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0020.jpg', 431202, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(297, 2, 3, 'IMG-20250927-WA0021.jpg', 'IMG-20250927-WA0021.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0021.jpg', 571833, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(298, 2, 3, 'IMG-20250927-WA0022.jpg', 'IMG-20250927-WA0022.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0022.jpg', 585504, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(299, 2, 3, 'IMG-20250927-WA0023.jpg', 'IMG-20250927-WA0023.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0023.jpg', 250652, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(300, 2, 3, 'IMG-20250927-WA0024.jpg', 'IMG-20250927-WA0024.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0024.jpg', 457693, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(301, 2, 3, 'IMG-20250927-WA0025.jpg', 'IMG-20250927-WA0025.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0025.jpg', 506258, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(302, 2, 3, 'IMG-20250927-WA0026.jpg', 'IMG-20250927-WA0026.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0026.jpg', 484074, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(303, 2, 3, 'IMG-20250927-WA0027.jpg', 'IMG-20250927-WA0027.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0027.jpg', 503578, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(304, 2, 3, 'IMG-20250927-WA0028.jpg', 'IMG-20250927-WA0028.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0028.jpg', 433432, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(305, 2, 3, 'IMG-20250927-WA0029.jpg', 'IMG-20250927-WA0029.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0029.jpg', 767732, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(306, 2, 3, 'IMG-20250927-WA0030.jpg', 'IMG-20250927-WA0030.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0030.jpg', 485161, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(307, 2, 3, 'IMG-20250927-WA0031.jpg', 'IMG-20250927-WA0031.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0031.jpg', 328557, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(308, 2, 3, 'IMG-20250927-WA0032.jpg', 'IMG-20250927-WA0032.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0032.jpg', 374735, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(309, 2, 3, 'IMG-20250927-WA0033.jpg', 'IMG-20250927-WA0033.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0033.jpg', 455889, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(310, 2, 3, 'IMG-20250927-WA0034.jpg', 'IMG-20250927-WA0034.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0034.jpg', 441643, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(311, 2, 3, 'IMG-20250927-WA0035.jpg', 'IMG-20250927-WA0035.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0035.jpg', 174455, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(312, 2, 3, 'IMG-20250927-WA0036.jpg', 'IMG-20250927-WA0036.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0036.jpg', 295929, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(313, 2, 3, 'IMG-20250927-WA0037.jpg', 'IMG-20250927-WA0037.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0037.jpg', 582596, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(314, 2, 3, 'IMG-20250927-WA0038.jpg', 'IMG-20250927-WA0038.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0038.jpg', 477458, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(315, 2, 3, 'IMG-20250927-WA0039.jpg', 'IMG-20250927-WA0039.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0039.jpg', 445506, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(316, 2, 3, 'IMG-20250927-WA0040.jpg', 'IMG-20250927-WA0040.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0040.jpg', 195075, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(317, 2, 3, 'IMG-20250927-WA0041.jpg', 'IMG-20250927-WA0041.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0041.jpg', 385960, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(318, 2, 3, 'IMG-20250927-WA0042.jpg', 'IMG-20250927-WA0042.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0042.jpg', 594291, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37');
INSERT INTO `photos` (`id`, `project_id`, `user_id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `title`, `description`, `category`, `photo_date`, `is_featured`, `created_at`, `updated_at`) VALUES
(319, 2, 3, 'IMG-20250927-WA0043.jpg', 'IMG-20250927-WA0043.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0043.jpg', 451430, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(320, 2, 3, 'IMG-20250927-WA0044.jpg', 'IMG-20250927-WA0044.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0044.jpg', 483141, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(321, 2, 3, 'IMG-20250927-WA0045.jpg', 'IMG-20250927-WA0045.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0045.jpg', 292982, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(322, 2, 3, 'IMG-20250927-WA0046.jpg', 'IMG-20250927-WA0046.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0046.jpg', 297138, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(323, 2, 3, 'IMG-20250927-WA0047.jpg', 'IMG-20250927-WA0047.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0047.jpg', 585728, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(324, 2, 3, 'IMG-20250927-WA0048.jpg', 'IMG-20250927-WA0048.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0048.jpg', 583663, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(325, 2, 3, 'IMG-20250927-WA0049.jpg', 'IMG-20250927-WA0049.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0049.jpg', 426361, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(326, 2, 3, 'IMG-20250927-WA0050.jpg', 'IMG-20250927-WA0050.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0050.jpg', 450803, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(327, 2, 3, 'IMG-20250927-WA0051.jpg', 'IMG-20250927-WA0051.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0051.jpg', 498601, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(328, 2, 3, 'IMG-20250927-WA0052.jpg', 'IMG-20250927-WA0052.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0052.jpg', 658040, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(329, 2, 3, 'IMG-20250927-WA0053.jpg', 'IMG-20250927-WA0053.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0053.jpg', 433722, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(330, 2, 3, 'IMG-20250927-WA0054.jpg', 'IMG-20250927-WA0054.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0054.jpg', 576435, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(331, 2, 3, 'IMG-20250927-WA0055.jpg', 'IMG-20250927-WA0055.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0055.jpg', 499079, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(332, 2, 3, 'IMG-20250927-WA0056.jpg', 'IMG-20250927-WA0056.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0056.jpg', 772165, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(333, 2, 3, 'IMG-20250927-WA0057.jpg', 'IMG-20250927-WA0057.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0057.jpg', 417286, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(334, 2, 3, 'IMG-20250927-WA0058.jpg', 'IMG-20250927-WA0058.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0058.jpg', 424159, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(335, 2, 3, 'IMG-20250927-WA0059.jpg', 'IMG-20250927-WA0059.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0059.jpg', 431359, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(336, 2, 3, 'IMG-20250927-WA0060.jpg', 'IMG-20250927-WA0060.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0060.jpg', 593380, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(337, 2, 3, 'IMG-20250927-WA0061.jpg', 'IMG-20250927-WA0061.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0061.jpg', 241099, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(338, 2, 3, 'IMG-20250927-WA0062.jpg', 'IMG-20250927-WA0062.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0062.jpg', 341681, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(339, 2, 3, 'IMG-20250927-WA0063.jpg', 'IMG-20250927-WA0063.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0063.jpg', 671743, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(340, 2, 3, 'IMG-20250927-WA0064.jpg', 'IMG-20250927-WA0064.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0064.jpg', 217200, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(341, 2, 3, 'IMG-20250927-WA0065.jpg', 'IMG-20250927-WA0065.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0065.jpg', 538023, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(342, 2, 3, 'IMG-20250927-WA0066.jpg', 'IMG-20250927-WA0066.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0066.jpg', 524718, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(343, 2, 3, 'IMG-20250927-WA0067.jpg', 'IMG-20250927-WA0067.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0067.jpg', 440419, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(344, 2, 3, 'IMG-20250927-WA0068.jpg', 'IMG-20250927-WA0068.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0068.jpg', 249703, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(345, 2, 3, 'IMG-20250927-WA0069.jpg', 'IMG-20250927-WA0069.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0069.jpg', 436118, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(346, 2, 3, 'IMG-20250927-WA0070.jpg', 'IMG-20250927-WA0070.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0070.jpg', 464468, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(347, 2, 3, 'IMG-20250927-WA0071.jpg', 'IMG-20250927-WA0071.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0071.jpg', 247444, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(348, 2, 3, 'IMG-20250927-WA0072.jpg', 'IMG-20250927-WA0072.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0072.jpg', 334144, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(349, 2, 3, 'IMG-20250927-WA0073.jpg', 'IMG-20250927-WA0073.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20250927-WA0073.jpg', 265572, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(350, 2, 3, 'IMG-20251006-WA0008.jpg', 'IMG-20251006-WA0008.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20251006-WA0008.jpg', 440237, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(351, 2, 3, 'IMG-20251006-WA0009.jpg', 'IMG-20251006-WA0009.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-26/IMG-20251006-WA0009.jpg', 593042, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(352, 2, 3, 'IMG-20251001-WA0002.jpg', 'IMG-20251001-WA0002.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0002.jpg', 99724, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(353, 2, 3, 'IMG-20251001-WA0003.jpg', 'IMG-20251001-WA0003.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0003.jpg', 66149, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(354, 2, 3, 'IMG-20251001-WA0004.jpg', 'IMG-20251001-WA0004.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0004.jpg', 89097, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(355, 2, 3, 'IMG-20251001-WA0005.jpg', 'IMG-20251001-WA0005.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0005.jpg', 106791, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(356, 2, 3, 'IMG-20251001-WA0006.jpg', 'IMG-20251001-WA0006.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0006.jpg', 75667, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(357, 2, 3, 'IMG-20251001-WA0007.jpg', 'IMG-20251001-WA0007.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0007.jpg', 73705, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(358, 2, 3, 'IMG-20251001-WA0008.jpg', 'IMG-20251001-WA0008.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0008.jpg', 87009, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(359, 2, 3, 'IMG-20251001-WA0009.jpg', 'IMG-20251001-WA0009.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0009.jpg', 64802, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(360, 2, 3, 'IMG-20251001-WA0010.jpg', 'IMG-20251001-WA0010.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0010.jpg', 74439, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(361, 2, 3, 'IMG-20251001-WA0011.jpg', 'IMG-20251001-WA0011.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0011.jpg', 105363, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(362, 2, 3, 'IMG-20251001-WA0012.jpg', 'IMG-20251001-WA0012.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0012.jpg', 98169, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(363, 2, 3, 'IMG-20251001-WA0013.jpg', 'IMG-20251001-WA0013.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0013.jpg', 115042, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(364, 2, 3, 'IMG-20251001-WA0014.jpg', 'IMG-20251001-WA0014.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0014.jpg', 144848, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:56', '2025-10-22 17:23:37'),
(365, 2, 3, 'IMG-20251001-WA0015.jpg', 'IMG-20251001-WA0015.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0015.jpg', 94871, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(366, 2, 3, 'IMG-20251001-WA0016.jpg', 'IMG-20251001-WA0016.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0016.jpg', 86475, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(367, 2, 3, 'IMG-20251001-WA0017.jpg', 'IMG-20251001-WA0017.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-29/IMG-20251001-WA0017.jpg', 86852, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(368, 2, 3, 'IMG-20251006-WA0011.jpg', 'IMG-20251006-WA0011.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0011.jpg', 236761, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(369, 2, 3, 'IMG-20251006-WA0012.jpg', 'IMG-20251006-WA0012.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0012.jpg', 256808, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(370, 2, 3, 'IMG-20251006-WA0013.jpg', 'IMG-20251006-WA0013.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0013.jpg', 111985, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(371, 2, 3, 'IMG-20251006-WA0014.jpg', 'IMG-20251006-WA0014.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0014.jpg', 224615, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(372, 2, 3, 'IMG-20251006-WA0015.jpg', 'IMG-20251006-WA0015.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0015.jpg', 127072, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(373, 2, 3, 'IMG-20251006-WA0016.jpg', 'IMG-20251006-WA0016.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0016.jpg', 97876, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(374, 2, 3, 'IMG-20251006-WA0017.jpg', 'IMG-20251006-WA0017.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0017.jpg', 248788, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(375, 2, 3, 'IMG-20251006-WA0018.jpg', 'IMG-20251006-WA0018.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0018.jpg', 254463, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(376, 2, 3, 'IMG-20251006-WA0019.jpg', 'IMG-20251006-WA0019.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0019.jpg', 285121, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(377, 2, 3, 'IMG-20251006-WA0020.jpg', 'IMG-20251006-WA0020.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0020.jpg', 258402, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(378, 2, 3, 'IMG-20251006-WA0021.jpg', 'IMG-20251006-WA0021.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0021.jpg', 43764, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(379, 2, 3, 'IMG-20251006-WA0022.jpg', 'IMG-20251006-WA0022.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0022.jpg', 61645, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(380, 2, 3, 'IMG-20251006-WA0023.jpg', 'IMG-20251006-WA0023.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0023.jpg', 59323, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(381, 2, 3, 'IMG-20251006-WA0024.jpg', 'IMG-20251006-WA0024.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0024.jpg', 110887, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(382, 2, 3, 'IMG-20251006-WA0025.jpg', 'IMG-20251006-WA0025.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0025.jpg', 120724, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(383, 2, 3, 'IMG-20251006-WA0026.jpg', 'IMG-20251006-WA0026.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0026.jpg', 7055, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(384, 2, 3, 'IMG-20251006-WA0027.jpg', 'IMG-20251006-WA0027.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0027.jpg', 221508, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(385, 2, 3, 'IMG-20251006-WA0029.jpg', 'IMG-20251006-WA0029.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0029.jpg', 122700, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(386, 2, 3, 'IMG-20251006-WA0030.jpg', 'IMG-20251006-WA0030.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0030.jpg', 123946, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(387, 2, 3, 'IMG-20251006-WA0031.jpg', 'IMG-20251006-WA0031.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0031.jpg', 117829, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(388, 2, 3, 'IMG-20251006-WA0032.jpg', 'IMG-20251006-WA0032.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0032.jpg', 171368, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(389, 2, 3, 'IMG-20251006-WA0033.jpg', 'IMG-20251006-WA0033.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0033.jpg', 103673, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(390, 2, 3, 'IMG-20251006-WA0034.jpg', 'IMG-20251006-WA0034.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0034.jpg', 90445, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(391, 2, 3, 'IMG-20251006-WA0037.jpg', 'IMG-20251006-WA0037.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0037.jpg', 31553, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(392, 2, 3, 'IMG-20251006-WA0038.jpg', 'IMG-20251006-WA0038.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0038.jpg', 246753, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(393, 2, 3, 'IMG-20251006-WA0039.jpg', 'IMG-20251006-WA0039.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0039.jpg', 152874, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(394, 2, 3, 'IMG-20251006-WA0040.jpg', 'IMG-20251006-WA0040.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0040.jpg', 21255, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(395, 2, 3, 'IMG-20251006-WA0041.jpg', 'IMG-20251006-WA0041.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0041.jpg', 25100, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(396, 2, 3, 'IMG-20251006-WA0042.jpg', 'IMG-20251006-WA0042.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0042.jpg', 30707, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(397, 2, 3, 'IMG-20251006-WA0043.jpg', 'IMG-20251006-WA0043.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0043.jpg', 38234, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(398, 2, 3, 'IMG-20251006-WA0044.jpg', 'IMG-20251006-WA0044.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/IMG-20251006-WA0044.jpg', 30753, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(399, 2, 3, 'WhatsApp Image 2025-09-03 at 11.58.50_ed9a2204.jpg', 'WhatsApp Image 2025-09-03 at 11.58.50_ed9a2204.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/WhatsApp Image 2025-09-03 at 11.58.50_ed9a2204.jpg', 68138, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-09-03', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(400, 2, 3, 'WhatsApp Image 2025-09-03 at 12.01.06_eb765cff.jpg', 'WhatsApp Image 2025-09-03 at 12.01.06_eb765cff.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/WhatsApp Image 2025-09-03 at 12.01.06_eb765cff.jpg', 221508, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-09-03', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(401, 2, 3, 'WhatsApp Image 2025-09-03 at 12.01.34_facfa341.jpg', 'WhatsApp Image 2025-09-03 at 12.01.34_facfa341.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/WhatsApp Image 2025-09-03 at 12.01.34_facfa341.jpg', 207257, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-09-03', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(402, 2, 3, 'WhatsApp Image 2025-09-03 at 12.05.42_a2253818.jpg', 'WhatsApp Image 2025-09-03 at 12.05.42_a2253818.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/WhatsApp Image 2025-09-03 at 12.05.42_a2253818.jpg', 44157, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-09-03', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(403, 2, 3, 'WhatsApp Image 2025-09-03 at 12.06.27_4b5ca583.jpg', 'WhatsApp Image 2025-09-03 at 12.06.27_4b5ca583.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/WhatsApp Image 2025-09-03 at 12.06.27_4b5ca583.jpg', 120355, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-09-03', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(404, 2, 3, 'WhatsApp Image 2025-09-03 at 12.06.27_e29e3307.jpg', 'WhatsApp Image 2025-09-03 at 12.06.27_e29e3307.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-3/WhatsApp Image 2025-09-03 at 12.06.27_e29e3307.jpg', 126757, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-09-03', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(405, 2, 3, 'IMG-20250914-WA0014.jpg', 'IMG-20250914-WA0014.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-9/IMG-20250914-WA0014.jpg', 95631, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(406, 2, 3, 'IMG-20250914-WA0015.jpg', 'IMG-20250914-WA0015.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-9/IMG-20250914-WA0015.jpg', 78409, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(407, 2, 3, 'IMG-20250914-WA0016.jpg', 'IMG-20250914-WA0016.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-9/IMG-20250914-WA0016.jpg', 82863, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(408, 2, 3, 'IMG-20250914-WA0017.jpg', 'IMG-20250914-WA0017.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-9/IMG-20250914-WA0017.jpg', 91218, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(409, 2, 3, 'IMG-20250914-WA0018.jpg', 'IMG-20250914-WA0018.jpg', 'assets/Photos/Aug-Sep/Busia-Photos-Sep-9/IMG-20250914-WA0018.jpg', 82833, 'image/jpeg', 'Construction Photo - Aug-Sep', 'Photo from Aug-Sep construction activities', 'Finishing', '2025-08-30', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(410, 2, 3, 'WhatsApp Image 2025-10-11 at 09.24.23_6533def7.jpg', 'WhatsApp Image 2025-10-11 at 09.24.23_6533def7.jpg', 'assets/Photos/October/Busia-Photos-Oct (11-13)/WhatsApp Image 2025-10-11 at 09.24.23_6533def7.jpg', 92694, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-11', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(411, 2, 3, 'WhatsApp Image 2025-10-13 at 13.16.50_4652db30.jpg', 'WhatsApp Image 2025-10-13 at 13.16.50_4652db30.jpg', 'assets/Photos/October/Busia-Photos-Oct (11-13)/WhatsApp Image 2025-10-13 at 13.16.50_4652db30.jpg', 98802, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-13', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(412, 2, 3, 'WhatsApp Image 2025-10-13 at 13.16.50_4a915be8.jpg', 'WhatsApp Image 2025-10-13 at 13.16.50_4a915be8.jpg', 'assets/Photos/October/Busia-Photos-Oct (11-13)/WhatsApp Image 2025-10-13 at 13.16.50_4a915be8.jpg', 87602, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-13', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(413, 2, 3, 'WhatsApp Image 2025-10-13 at 13.16.50_cd331ac3.jpg', 'WhatsApp Image 2025-10-13 at 13.16.50_cd331ac3.jpg', 'assets/Photos/October/Busia-Photos-Oct (11-13)/WhatsApp Image 2025-10-13 at 13.16.50_cd331ac3.jpg', 70867, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-13', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(414, 2, 3, 'WhatsApp Image 2025-10-11 at 09.24.23_6533def7.jpg', 'WhatsApp Image 2025-10-11 at 09.24.23_6533def7.jpg', 'assets/Photos/October/Busia-Photos-Oct-11-13/WhatsApp Image 2025-10-11 at 09.24.23_6533def7.jpg', 92694, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-11', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(415, 2, 3, 'WhatsApp Image 2025-10-13 at 13.16.50_4652db30.jpg', 'WhatsApp Image 2025-10-13 at 13.16.50_4652db30.jpg', 'assets/Photos/October/Busia-Photos-Oct-11-13/WhatsApp Image 2025-10-13 at 13.16.50_4652db30.jpg', 98802, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-13', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(416, 2, 3, 'WhatsApp Image 2025-10-13 at 13.16.50_4a915be8.jpg', 'WhatsApp Image 2025-10-13 at 13.16.50_4a915be8.jpg', 'assets/Photos/October/Busia-Photos-Oct-11-13/WhatsApp Image 2025-10-13 at 13.16.50_4a915be8.jpg', 87602, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-13', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(417, 2, 3, 'WhatsApp Image 2025-10-13 at 13.16.50_cd331ac3.jpg', 'WhatsApp Image 2025-10-13 at 13.16.50_cd331ac3.jpg', 'assets/Photos/October/Busia-Photos-Oct-11-13/WhatsApp Image 2025-10-13 at 13.16.50_cd331ac3.jpg', 70867, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-13', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(418, 2, 3, 'IMG-20251015-WA0001.jpg', 'IMG-20251015-WA0001.jpg', 'assets/Photos/October/Busia-Photos-Oct-15/IMG-20251015-WA0001.jpg', 274213, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(419, 2, 3, 'IMG-20251015-WA0002.jpg', 'IMG-20251015-WA0002.jpg', 'assets/Photos/October/Busia-Photos-Oct-15/IMG-20251015-WA0002.jpg', 178365, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(420, 2, 3, 'IMG-20251015-WA0003.jpg', 'IMG-20251015-WA0003.jpg', 'assets/Photos/October/Busia-Photos-Oct-15/IMG-20251015-WA0003.jpg', 398347, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(421, 2, 3, 'IMG-20251015-WA0004.jpg', 'IMG-20251015-WA0004.jpg', 'assets/Photos/October/Busia-Photos-Oct-15/IMG-20251015-WA0004.jpg', 221178, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(422, 2, 3, 'IMG-20251016-WA0005.jpg', 'IMG-20251016-WA0005.jpg', 'assets/Photos/October/Busia-Photos-Oct-15/IMG-20251016-WA0005.jpg', 88291, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(423, 2, 3, 'IMG-20251016-WA0006.jpg', 'IMG-20251016-WA0006.jpg', 'assets/Photos/October/Busia-Photos-Oct-15/IMG-20251016-WA0006.jpg', 74476, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(424, 2, 3, 'IMG-20251016-WA0007.jpg', 'IMG-20251016-WA0007.jpg', 'assets/Photos/October/Busia-Photos-Oct-15/IMG-20251016-WA0007.jpg', 80744, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:57', '2025-10-22 17:23:37'),
(425, 2, 3, 'IMG-20251016-WA0008.jpg', 'IMG-20251016-WA0008.jpg', 'assets/Photos/October/Busia-Photos-Oct-15/IMG-20251016-WA0008.jpg', 102203, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(426, 2, 3, 'IMG-20251016-WA0009.jpg', 'IMG-20251016-WA0009.jpg', 'assets/Photos/October/Busia-Photos-Oct-15/IMG-20251016-WA0009.jpg', 67314, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(427, 2, 3, 'IMG-20251016-WA0010.jpg', 'IMG-20251016-WA0010.jpg', 'assets/Photos/October/Busia-Photos-Oct-15/IMG-20251016-WA0010.jpg', 113030, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(428, 2, 3, 'IMG-20251018-WA0003.jpg', 'IMG-20251018-WA0003.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0003.jpg', 554687, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(429, 2, 3, 'IMG-20251018-WA0004.jpg', 'IMG-20251018-WA0004.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0004.jpg', 556698, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(430, 2, 3, 'IMG-20251018-WA0005.jpg', 'IMG-20251018-WA0005.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0005.jpg', 534197, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(431, 2, 3, 'IMG-20251018-WA0006.jpg', 'IMG-20251018-WA0006.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0006.jpg', 473998, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(432, 2, 3, 'IMG-20251018-WA0007.jpg', 'IMG-20251018-WA0007.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0007.jpg', 574746, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(433, 2, 3, 'IMG-20251018-WA0008.jpg', 'IMG-20251018-WA0008.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0008.jpg', 536030, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(434, 2, 3, 'IMG-20251018-WA0009.jpg', 'IMG-20251018-WA0009.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0009.jpg', 511807, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(435, 2, 3, 'IMG-20251018-WA0010.jpg', 'IMG-20251018-WA0010.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0010.jpg', 444341, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(436, 2, 3, 'IMG-20251018-WA0011.jpg', 'IMG-20251018-WA0011.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0011.jpg', 449924, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(437, 2, 3, 'IMG-20251018-WA0012.jpg', 'IMG-20251018-WA0012.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0012.jpg', 551989, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(438, 2, 3, 'IMG-20251018-WA0013.jpg', 'IMG-20251018-WA0013.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0013.jpg', 401185, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(439, 2, 3, 'IMG-20251018-WA0014.jpg', 'IMG-20251018-WA0014.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0014.jpg', 418568, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(440, 2, 3, 'IMG-20251018-WA0015.jpg', 'IMG-20251018-WA0015.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0015.jpg', 429261, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(441, 2, 3, 'IMG-20251018-WA0016.jpg', 'IMG-20251018-WA0016.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0016.jpg', 408942, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(442, 2, 3, 'IMG-20251018-WA0017.jpg', 'IMG-20251018-WA0017.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0017.jpg', 436572, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(443, 2, 3, 'IMG-20251018-WA0018.jpg', 'IMG-20251018-WA0018.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0018.jpg', 501775, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(444, 2, 3, 'IMG-20251018-WA0019.jpg', 'IMG-20251018-WA0019.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0019.jpg', 471893, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(445, 2, 3, 'IMG-20251018-WA0020.jpg', 'IMG-20251018-WA0020.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0020.jpg', 602198, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(446, 2, 3, 'IMG-20251018-WA0021.jpg', 'IMG-20251018-WA0021.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0021.jpg', 398435, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(447, 2, 3, 'IMG-20251018-WA0022.jpg', 'IMG-20251018-WA0022.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0022.jpg', 405193, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(448, 2, 3, 'IMG-20251018-WA0023.jpg', 'IMG-20251018-WA0023.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0023.jpg', 429898, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(449, 2, 3, 'IMG-20251018-WA0024.jpg', 'IMG-20251018-WA0024.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0024.jpg', 569230, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(450, 2, 3, 'IMG-20251018-WA0025.jpg', 'IMG-20251018-WA0025.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0025.jpg', 570052, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(451, 2, 3, 'IMG-20251018-WA0026.jpg', 'IMG-20251018-WA0026.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0026.jpg', 562942, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(452, 2, 3, 'IMG-20251018-WA0027.jpg', 'IMG-20251018-WA0027.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0027.jpg', 602915, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(453, 2, 3, 'IMG-20251018-WA0028.jpg', 'IMG-20251018-WA0028.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0028.jpg', 603777, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(454, 2, 3, 'IMG-20251018-WA0029.jpg', 'IMG-20251018-WA0029.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0029.jpg', 593490, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(455, 2, 3, 'IMG-20251018-WA0030.jpg', 'IMG-20251018-WA0030.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0030.jpg', 605268, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(456, 2, 3, 'IMG-20251018-WA0031.jpg', 'IMG-20251018-WA0031.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0031.jpg', 358262, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(457, 2, 3, 'IMG-20251018-WA0032.jpg', 'IMG-20251018-WA0032.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0032.jpg', 347763, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(458, 2, 3, 'IMG-20251018-WA0033.jpg', 'IMG-20251018-WA0033.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0033.jpg', 475378, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(459, 2, 3, 'IMG-20251018-WA0034.jpg', 'IMG-20251018-WA0034.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0034.jpg', 499903, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(460, 2, 3, 'IMG-20251018-WA0035.jpg', 'IMG-20251018-WA0035.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0035.jpg', 455105, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(461, 2, 3, 'IMG-20251018-WA0036.jpg', 'IMG-20251018-WA0036.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0036.jpg', 445810, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(462, 2, 3, 'IMG-20251018-WA0037.jpg', 'IMG-20251018-WA0037.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0037.jpg', 480963, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(463, 2, 3, 'IMG-20251018-WA0038.jpg', 'IMG-20251018-WA0038.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0038.jpg', 193018, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(464, 2, 3, 'IMG-20251018-WA0039.jpg', 'IMG-20251018-WA0039.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0039.jpg', 110257, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(465, 2, 3, 'IMG-20251018-WA0040.jpg', 'IMG-20251018-WA0040.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251018-WA0040.jpg', 174491, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(466, 2, 3, 'IMG-20251021-WA0003.jpg', 'IMG-20251021-WA0003.jpg', 'assets/Photos/October/Busia-Photos-Oct-18/IMG-20251021-WA0003.jpg', 560550, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(467, 2, 3, 'IMG-20251001-WA0006.jpg', 'IMG-20251001-WA0006.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251001-WA0006.jpg', 75667, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(468, 2, 3, 'IMG-20251001-WA0007.jpg', 'IMG-20251001-WA0007.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251001-WA0007.jpg', 73705, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(469, 2, 3, 'IMG-20251001-WA0008.jpg', 'IMG-20251001-WA0008.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251001-WA0008.jpg', 87009, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(470, 2, 3, 'IMG-20251001-WA0009.jpg', 'IMG-20251001-WA0009.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251001-WA0009.jpg', 64802, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(471, 2, 3, 'IMG-20251001-WA0010.jpg', 'IMG-20251001-WA0010.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251001-WA0010.jpg', 74439, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(472, 2, 3, 'IMG-20251001-WA0011.jpg', 'IMG-20251001-WA0011.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251001-WA0011.jpg', 105363, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(473, 2, 3, 'IMG-20251007-WA0004.jpg', 'IMG-20251007-WA0004.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0004.jpg', 117804, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(474, 2, 3, 'IMG-20251007-WA0005.jpg', 'IMG-20251007-WA0005.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0005.jpg', 87781, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37');
INSERT INTO `photos` (`id`, `project_id`, `user_id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `title`, `description`, `category`, `photo_date`, `is_featured`, `created_at`, `updated_at`) VALUES
(475, 2, 3, 'IMG-20251007-WA0006.jpg', 'IMG-20251007-WA0006.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0006.jpg', 107174, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(476, 2, 3, 'IMG-20251007-WA0007.jpg', 'IMG-20251007-WA0007.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0007.jpg', 59592, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(477, 2, 3, 'IMG-20251007-WA0008.jpg', 'IMG-20251007-WA0008.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0008.jpg', 49022, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(478, 2, 3, 'IMG-20251007-WA0009.jpg', 'IMG-20251007-WA0009.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0009.jpg', 46342, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(479, 2, 3, 'IMG-20251007-WA0010.jpg', 'IMG-20251007-WA0010.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0010.jpg', 85634, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(480, 2, 3, 'IMG-20251007-WA0011.jpg', 'IMG-20251007-WA0011.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0011.jpg', 183351, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(481, 2, 3, 'IMG-20251007-WA0012.jpg', 'IMG-20251007-WA0012.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0012.jpg', 140208, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(482, 2, 3, 'IMG-20251007-WA0013.jpg', 'IMG-20251007-WA0013.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0013.jpg', 213616, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(483, 2, 3, 'IMG-20251007-WA0014.jpg', 'IMG-20251007-WA0014.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0014.jpg', 58379, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(484, 2, 3, 'IMG-20251007-WA0015.jpg', 'IMG-20251007-WA0015.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0015.jpg', 87964, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(485, 2, 3, 'IMG-20251007-WA0016.jpg', 'IMG-20251007-WA0016.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0016.jpg', 58883, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(486, 2, 3, 'IMG-20251007-WA0017.jpg', 'IMG-20251007-WA0017.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0017.jpg', 74619, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(487, 2, 3, 'IMG-20251007-WA0018.jpg', 'IMG-20251007-WA0018.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0018.jpg', 121848, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(488, 2, 3, 'IMG-20251007-WA0019.jpg', 'IMG-20251007-WA0019.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0019.jpg', 112543, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(489, 2, 3, 'IMG-20251007-WA0020.jpg', 'IMG-20251007-WA0020.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0020.jpg', 84252, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(490, 2, 3, 'IMG-20251007-WA0021.jpg', 'IMG-20251007-WA0021.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0021.jpg', 91430, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(491, 2, 3, 'IMG-20251007-WA0022.jpg', 'IMG-20251007-WA0022.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0022.jpg', 58531, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(492, 2, 3, 'IMG-20251007-WA0023.jpg', 'IMG-20251007-WA0023.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0023.jpg', 92452, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(493, 2, 3, 'IMG-20251007-WA0024.jpg', 'IMG-20251007-WA0024.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0024.jpg', 81606, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(494, 2, 3, 'IMG-20251007-WA0025.jpg', 'IMG-20251007-WA0025.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0025.jpg', 45746, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(495, 2, 3, 'IMG-20251007-WA0026.jpg', 'IMG-20251007-WA0026.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0026.jpg', 89726, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(496, 2, 3, 'IMG-20251007-WA0027.jpg', 'IMG-20251007-WA0027.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0027.jpg', 92520, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(497, 2, 3, 'IMG-20251007-WA0028.jpg', 'IMG-20251007-WA0028.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/IMG-20251007-WA0028.jpg', 63495, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(498, 2, 3, 'WhatsApp Image 2025-10-07 at 20.21.34_9dad772d.jpg', 'WhatsApp Image 2025-10-07 at 20.21.34_9dad772d.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/WhatsApp Image 2025-10-07 at 20.21.34_9dad772d.jpg', 65210, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-07', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(499, 2, 3, 'WhatsApp Image 2025-10-07 at 20.21.35_281d1e5b.jpg', 'WhatsApp Image 2025-10-07 at 20.21.35_281d1e5b.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/WhatsApp Image 2025-10-07 at 20.21.35_281d1e5b.jpg', 60609, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-07', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(500, 2, 3, 'WhatsApp Image 2025-10-07 at 20.21.35_7b3a17e0.jpg', 'WhatsApp Image 2025-10-07 at 20.21.35_7b3a17e0.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/WhatsApp Image 2025-10-07 at 20.21.35_7b3a17e0.jpg', 64528, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-07', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(501, 2, 3, 'WhatsApp Image 2025-10-07 at 20.21.38_f1b60009.jpg', 'WhatsApp Image 2025-10-07 at 20.21.38_f1b60009.jpg', 'assets/Photos/October/Busia-Photos-Oct-7/WhatsApp Image 2025-10-07 at 20.21.38_f1b60009.jpg', 65210, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-07', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(502, 2, 3, 'IMG-20251001-WA0006.jpg', 'IMG-20251001-WA0006.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251001-WA0006.jpg', 75667, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(503, 2, 3, 'IMG-20251001-WA0007.jpg', 'IMG-20251001-WA0007.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251001-WA0007.jpg', 73705, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(504, 2, 3, 'IMG-20251001-WA0008.jpg', 'IMG-20251001-WA0008.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251001-WA0008.jpg', 87009, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:58', '2025-10-22 17:23:37'),
(505, 2, 3, 'IMG-20251001-WA0009.jpg', 'IMG-20251001-WA0009.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251001-WA0009.jpg', 64802, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(506, 2, 3, 'IMG-20251001-WA0010.jpg', 'IMG-20251001-WA0010.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251001-WA0010.jpg', 74439, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(507, 2, 3, 'IMG-20251001-WA0011.jpg', 'IMG-20251001-WA0011.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251001-WA0011.jpg', 105363, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(508, 2, 3, 'IMG-20251007-WA0004.jpg', 'IMG-20251007-WA0004.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0004.jpg', 117804, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(509, 2, 3, 'IMG-20251007-WA0005.jpg', 'IMG-20251007-WA0005.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0005.jpg', 87781, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(510, 2, 3, 'IMG-20251007-WA0006.jpg', 'IMG-20251007-WA0006.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0006.jpg', 107174, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(511, 2, 3, 'IMG-20251007-WA0007.jpg', 'IMG-20251007-WA0007.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0007.jpg', 59592, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(512, 2, 3, 'IMG-20251007-WA0008.jpg', 'IMG-20251007-WA0008.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0008.jpg', 49022, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(513, 2, 3, 'IMG-20251007-WA0009.jpg', 'IMG-20251007-WA0009.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0009.jpg', 46342, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(514, 2, 3, 'IMG-20251007-WA0010.jpg', 'IMG-20251007-WA0010.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0010.jpg', 85634, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(515, 2, 3, 'IMG-20251007-WA0011.jpg', 'IMG-20251007-WA0011.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0011.jpg', 183351, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(516, 2, 3, 'IMG-20251007-WA0012.jpg', 'IMG-20251007-WA0012.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0012.jpg', 140208, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(517, 2, 3, 'IMG-20251007-WA0013.jpg', 'IMG-20251007-WA0013.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0013.jpg', 213616, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(518, 2, 3, 'IMG-20251007-WA0014.jpg', 'IMG-20251007-WA0014.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0014.jpg', 58379, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(519, 2, 3, 'IMG-20251007-WA0015.jpg', 'IMG-20251007-WA0015.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0015.jpg', 87964, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(520, 2, 3, 'IMG-20251007-WA0016.jpg', 'IMG-20251007-WA0016.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0016.jpg', 58883, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(521, 2, 3, 'IMG-20251007-WA0017.jpg', 'IMG-20251007-WA0017.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0017.jpg', 74619, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(522, 2, 3, 'IMG-20251007-WA0018.jpg', 'IMG-20251007-WA0018.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0018.jpg', 121848, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(523, 2, 3, 'IMG-20251007-WA0019.jpg', 'IMG-20251007-WA0019.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0019.jpg', 112543, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(524, 2, 3, 'IMG-20251007-WA0020.jpg', 'IMG-20251007-WA0020.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0020.jpg', 84252, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(525, 2, 3, 'IMG-20251007-WA0021.jpg', 'IMG-20251007-WA0021.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0021.jpg', 91430, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(526, 2, 3, 'IMG-20251007-WA0022.jpg', 'IMG-20251007-WA0022.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0022.jpg', 58531, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(527, 2, 3, 'IMG-20251007-WA0023.jpg', 'IMG-20251007-WA0023.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0023.jpg', 92452, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(528, 2, 3, 'IMG-20251007-WA0024.jpg', 'IMG-20251007-WA0024.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0024.jpg', 81606, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(529, 2, 3, 'IMG-20251007-WA0025.jpg', 'IMG-20251007-WA0025.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0025.jpg', 45746, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(530, 2, 3, 'IMG-20251007-WA0026.jpg', 'IMG-20251007-WA0026.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0026.jpg', 89726, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(531, 2, 3, 'IMG-20251007-WA0027.jpg', 'IMG-20251007-WA0027.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0027.jpg', 92520, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(532, 2, 3, 'IMG-20251007-WA0028.jpg', 'IMG-20251007-WA0028.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251007-WA0028.jpg', 63495, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(533, 2, 3, 'IMG-20251009-WA0002.jpg', 'IMG-20251009-WA0002.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251009-WA0002.jpg', 136913, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(534, 2, 3, 'IMG-20251009-WA0003.jpg', 'IMG-20251009-WA0003.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251009-WA0003.jpg', 161970, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(535, 2, 3, 'IMG-20251009-WA0004.jpg', 'IMG-20251009-WA0004.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251009-WA0004.jpg', 284010, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(536, 2, 3, 'IMG-20251009-WA0005.jpg', 'IMG-20251009-WA0005.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251009-WA0005.jpg', 212902, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(537, 2, 3, 'IMG-20251009-WA0006.jpg', 'IMG-20251009-WA0006.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251009-WA0006.jpg', 72488, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(538, 2, 3, 'IMG-20251009-WA0007.jpg', 'IMG-20251009-WA0007.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251009-WA0007.jpg', 156978, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(539, 2, 3, 'IMG-20251011-WA0001.jpg', 'IMG-20251011-WA0001.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251011-WA0001.jpg', 41020, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(540, 2, 3, 'IMG-20251011-WA0002.jpg', 'IMG-20251011-WA0002.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251011-WA0002.jpg', 46688, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(541, 2, 3, 'IMG-20251011-WA0003.jpg', 'IMG-20251011-WA0003.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251011-WA0003.jpg', 28734, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(542, 2, 3, 'IMG-20251011-WA0004.jpg', 'IMG-20251011-WA0004.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251011-WA0004.jpg', 34787, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(543, 2, 3, 'IMG-20251011-WA0005.jpg', 'IMG-20251011-WA0005.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251011-WA0005.jpg', 53944, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(544, 2, 3, 'IMG-20251011-WA0006.jpg', 'IMG-20251011-WA0006.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251011-WA0006.jpg', 63940, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(545, 2, 3, 'IMG-20251011-WA0007.jpg', 'IMG-20251011-WA0007.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251011-WA0007.jpg', 52105, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37'),
(546, 2, 3, 'IMG-20251011-WA0008.jpg', 'IMG-20251011-WA0008.jpg', 'assets/Photos/October/Busia-Photos-Oct-9/IMG-20251011-WA0008.jpg', 47130, 'image/jpeg', 'Construction Photo - October', 'Photo from October construction activities', 'Final Touches', '2025-10-15', 0, '2025-10-22 16:57:59', '2025-10-22 17:23:37');

-- --------------------------------------------------------

--
-- Table structure for table `photo_annotations`
--

CREATE TABLE `photo_annotations` (
  `id` int NOT NULL,
  `photo_id` int NOT NULL,
  `user_id` int NOT NULL,
  `annotated_image_path` varchar(500) DEFAULT NULL,
  `annotation_data` text,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `photo_annotations`
--

INSERT INTO `photo_annotations` (`id`, `photo_id`, `user_id`, `annotated_image_path`, `annotation_data`, `comment`, `created_at`) VALUES
(1, 506, 3, 'uploads/annotations/annotation_506_1761163526.png', '[\"data:image/png;base64,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', 'Improper placement', '2025-10-22 20:05:26');

-- --------------------------------------------------------

--
-- Table structure for table `photo_comments`
--

CREATE TABLE `photo_comments` (
  `id` int NOT NULL,
  `photo_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comment` text NOT NULL,
  `type` enum('issue','note','approval','question') DEFAULT 'note',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `client_id` int NOT NULL,
  `manager_id` int DEFAULT NULL,
  `status` enum('planning','active','on_hold','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'planning',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `budget` decimal(15,2) DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `progress` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `client_id`, `manager_id`, `status`, `start_date`, `end_date`, `budget`, `location`, `created_at`, `updated_at`, `progress`) VALUES
(1, 'Residential House Construction', 'Construction of a 3-bedroom residential house in Nairobi', 2, NULL, 'active', '2024-01-15', '2024-12-31', 2500000.00, 'Nairobi, Kenya', '2025-10-21 20:38:38', '2025-10-21 20:38:38', 0),
(2, 'Busia Home Construction', 'Residential house construction project in Busia County. This is a comprehensive project including foundation work, structural construction, roofing, electrical, plumbing, and finishing works.', 3, NULL, 'active', '2025-01-15', '2025-12-31', 5000000.00, 'Busia County, Kenya', '2025-10-22 16:57:52', '2025-10-22 17:23:37', 45);

-- --------------------------------------------------------

--
-- Table structure for table `project_shares`
--

CREATE TABLE `project_shares` (
  `id` int NOT NULL,
  `project_id` int NOT NULL,
  `shared_by` int NOT NULL,
  `shared_with` int NOT NULL,
  `permission_level` enum('view','comment','edit') DEFAULT 'view',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `declined_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','accepted','declined') DEFAULT 'pending',
  `shared_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project_shares`
--

INSERT INTO `project_shares` (`id`, `project_id`, `shared_by`, `shared_with`, `permission_level`, `created_at`, `accepted_at`, `declined_at`, `status`, `shared_at`) VALUES
(1, 2, 3, 4, 'edit', '2025-10-22 20:48:36', '2025-10-23 00:49:27', NULL, 'accepted', '2025-10-22 20:48:36');

-- --------------------------------------------------------

--
-- Table structure for table `project_timelines`
--

CREATE TABLE `project_timelines` (
  `id` int NOT NULL,
  `project_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('pending','in_progress','completed','delayed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `priority` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_timelines`
--

INSERT INTO `project_timelines` (`id`, `project_id`, `title`, `description`, `start_date`, `end_date`, `status`, `priority`, `created_at`, `updated_at`) VALUES
(1, 1, 'Foundation Work', 'Excavation and foundation laying', '2024-01-15', '2024-02-28', 'completed', 'high', '2025-10-21 20:38:38', '2025-10-21 20:38:38'),
(2, 1, 'Wall Construction', 'Building walls and structural elements', '2024-03-01', '2024-05-31', 'in_progress', 'high', '2025-10-21 20:38:38', '2025-10-21 20:38:38'),
(3, 1, 'Roofing', 'Installation of roof structure and materials', '2024-06-01', '2024-07-31', 'pending', 'medium', '2025-10-21 20:38:38', '2025-10-21 20:38:38');

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `id` int NOT NULL,
  `expense_id` int NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ocr_data` json DEFAULT NULL,
  `ocr_confidence` decimal(5,2) DEFAULT NULL,
  `extracted_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `extracted_amount` decimal(15,2) DEFAULT NULL,
  `extracted_date` date DEFAULT NULL,
  `extracted_merchant` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `extracted_receipt_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ocr_language` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ocr_provider` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `amount_confidence` decimal(5,2) DEFAULT NULL,
  `date_confidence` decimal(5,2) DEFAULT NULL,
  `merchant_confidence` decimal(5,2) DEFAULT NULL,
  `receipt_id_confidence` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `needs_verification` tinyint(1) DEFAULT '0',
  `verification_status` enum('pending','verified','rejected','auto_verified') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','client','manager') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'client',
  `status` enum('active','inactive','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `profile_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `first_name`, `last_name`, `phone`, `role`, `status`, `profile_image`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@constructionmanager.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', NULL, 'admin', 'active', NULL, '2025-10-21 20:36:42', '2025-10-21 20:36:42'),
(2, 'client1', 'client@example.com', '$2y$10$AOB532abcr98S3/aKQAGf.RMvf7uZkTgURr1H8jMKWwGU0RHN664S', 'John', 'Doe', '+254712345678', 'client', 'active', NULL, '2025-10-21 20:38:37', '2025-10-21 20:38:37'),
(3, 'danielobam', 'danielobam@gmail.com', '$2y$10$rlOleGbuZL3BZv1mLHMDKOhZW65m3XNa5HuIDYun.YSp76ENbEfdG', 'Daniel', 'Obam', '+254712345678', 'client', 'active', NULL, '2025-10-22 17:23:37', '2025-10-22 17:23:37'),
(4, 'htambo', 'htambo@tamconconsult.com', '$2y$10$8zqGcFLNkbR23bciL37L5.zQpv7jXVzmV6F1rWIKm/Ajui3rhfDse', 'Haggai', 'Tambo', '+254700000000', 'client', 'active', NULL, '2025-10-22 17:53:41', '2025-10-22 17:53:41'),
(5, 'juniortambo2628@gmail.com', 'juniortambo2628@gmail.com', '$2y$10$/03glMoq8kPTT1kY0uil6usARSOoHH2aFMEY1LUvL1RxZLsCLJfVm', 'Kevin', 'Tambo', '0705883227', 'client', 'active', NULL, '2025-10-23 00:57:09', '2025-10-23 00:57:09');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `session_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whatsapp_contacts`
--

CREATE TABLE `whatsapp_contacts` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whatsapp_logs`
--

CREATE TABLE `whatsapp_logs` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `direction` enum('inbound','outbound') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('sent','received','read','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'sent',
  `message_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whatsapp_webhook_events`
--

CREATE TABLE `whatsapp_webhook_events` (
  `id` int NOT NULL,
  `payload` json NOT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed` tinyint(1) DEFAULT '0',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_date` (`document_date`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `document_annotations`
--
ALTER TABLE `document_annotations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_document_id` (`document_id`),
  ADD KEY `idx_page_number` (`page_number`);

--
-- Indexes for table `document_comments`
--
ALTER TABLE `document_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_document_id` (`document_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_email_type` (`email_type`),
  ADD KEY `idx_sent_at` (`sent_at`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_receipt` (`receipt_id`),
  ADD KEY `idx_date` (`expense_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `photos`
--
ALTER TABLE `photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_featured` (`is_featured`),
  ADD KEY `idx_date` (`photo_date`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `photo_annotations`
--
ALTER TABLE `photo_annotations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_photo` (`photo_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `photo_comments`
--
ALTER TABLE `photo_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_photo` (`photo_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_client` (`client_id`),
  ADD KEY `idx_manager` (`manager_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `project_shares`
--
ALTER TABLE `project_shares`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_share` (`project_id`,`shared_with`),
  ADD KEY `shared_by` (`shared_by`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_shared_with` (`shared_with`);

--
-- Indexes for table `project_timelines`
--
ALTER TABLE `project_timelines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_priority` (`priority`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_expense` (`expense_id`),
  ADD KEY `idx_filename` (`filename`),
  ADD KEY `idx_needs_verification` (`needs_verification`),
  ADD KEY `idx_verification_status` (`verification_status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_token` (`session_token`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `whatsapp_contacts`
--
ALTER TABLE `whatsapp_contacts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone_number` (`phone_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `whatsapp_logs`
--
ALTER TABLE `whatsapp_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `message_id` (`message_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `whatsapp_webhook_events`
--
ALTER TABLE `whatsapp_webhook_events`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `document_annotations`
--
ALTER TABLE `document_annotations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_comments`
--
ALTER TABLE `document_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_logs`
--
ALTER TABLE `email_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=120;

--
-- AUTO_INCREMENT for table `photos`
--
ALTER TABLE `photos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=547;

--
-- AUTO_INCREMENT for table `photo_annotations`
--
ALTER TABLE `photo_annotations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `photo_comments`
--
ALTER TABLE `photo_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `project_shares`
--
ALTER TABLE `project_shares`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `project_timelines`
--
ALTER TABLE `project_timelines`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `whatsapp_contacts`
--
ALTER TABLE `whatsapp_contacts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `whatsapp_logs`
--
ALTER TABLE `whatsapp_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `whatsapp_webhook_events`
--
ALTER TABLE `whatsapp_webhook_events`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_annotations`
--
ALTER TABLE `document_annotations`
  ADD CONSTRAINT `document_annotations_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_annotations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_comments`
--
ALTER TABLE `document_comments`
  ADD CONSTRAINT `document_comments_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `photos`
--
ALTER TABLE `photos`
  ADD CONSTRAINT `photos_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `photos_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `photo_annotations`
--
ALTER TABLE `photo_annotations`
  ADD CONSTRAINT `photo_annotations_ibfk_1` FOREIGN KEY (`photo_id`) REFERENCES `photos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `photo_annotations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `photo_comments`
--
ALTER TABLE `photo_comments`
  ADD CONSTRAINT `photo_comments_ibfk_1` FOREIGN KEY (`photo_id`) REFERENCES `photos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `photo_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `project_shares`
--
ALTER TABLE `project_shares`
  ADD CONSTRAINT `project_shares_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_shares_ibfk_2` FOREIGN KEY (`shared_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_shares_ibfk_3` FOREIGN KEY (`shared_with`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_timelines`
--
ALTER TABLE `project_timelines`
  ADD CONSTRAINT `project_timelines_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `receipts`
--
ALTER TABLE `receipts`
  ADD CONSTRAINT `receipts_ibfk_1` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `whatsapp_contacts`
--
ALTER TABLE `whatsapp_contacts`
  ADD CONSTRAINT `whatsapp_contacts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `whatsapp_logs`
--
ALTER TABLE `whatsapp_logs`
  ADD CONSTRAINT `whatsapp_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
