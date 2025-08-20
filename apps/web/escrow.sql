-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: paylox_escrow
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `advert_documents`
--

DROP TABLE IF EXISTS `advert_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `advert_documents` (
  `id` int unsigned NOT NULL,
  `advert_id` int unsigned NOT NULL,
  `upload_id` int unsigned NOT NULL,
  `sort` int unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advert_documents`
--

LOCK TABLES `advert_documents` WRITE;
/*!40000 ALTER TABLE `advert_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `advert_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `advert_list`
--

DROP TABLE IF EXISTS `advert_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `advert_list` (
  `id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `category_id` int unsigned NOT NULL,
  `currency_id` int unsigned NOT NULL,
  `price` decimal(10,0) unsigned NOT NULL,
  `advert_status` enum('0','1','2') NOT NULL,
  `comment` varchar(500) NOT NULL,
  `title` varchar(50) NOT NULL,
  `chassis_no` int unsigned NOT NULL,
  `plate` varchar(45) NOT NULL,
  `brand` varchar(45) NOT NULL,
  `year` varchar(45) NOT NULL,
  `added_by` int unsigned NOT NULL,
  `added_date` datetime NOT NULL,
  `modified_by` int unsigned NOT NULL,
  `modified_date` datetime NOT NULL,
  `active` enum('0','1') NOT NULL DEFAULT '1',
  `locked` enum('0','1') NOT NULL DEFAULT '0',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advert_list`
--

LOCK TABLES `advert_list` WRITE;
/*!40000 ALTER TABLE `advert_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `advert_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `advert_statuses`
--

DROP TABLE IF EXISTS `advert_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `advert_statuses` (
  `id` int unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `added_by` int unsigned NOT NULL,
  `added_date` datetime NOT NULL,
  `modified_by` int unsigned NOT NULL,
  `modified_date` datetime NOT NULL,
  `active` enum('0','1') NOT NULL DEFAULT '1',
  `locked` enum('0','1') NOT NULL DEFAULT '0',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advert_statuses`
--

LOCK TABLES `advert_statuses` WRITE;
/*!40000 ALTER TABLE `advert_statuses` DISABLE KEYS */;
/*!40000 ALTER TABLE `advert_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `broker_consultants`
--

DROP TABLE IF EXISTS `broker_consultants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `broker_consultants` (
  `id` int unsigned NOT NULL,
  `broker_id` int unsigned NOT NULL,
  `consultant_user_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `broker_consultants`
--

LOCK TABLES `broker_consultants` WRITE;
/*!40000 ALTER TABLE `broker_consultants` DISABLE KEYS */;
/*!40000 ALTER TABLE `broker_consultants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `broker_list`
--

DROP TABLE IF EXISTS `broker_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `broker_list` (
  `id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `added_by` int unsigned NOT NULL,
  `added_date` datetime NOT NULL,
  `modified_by` int unsigned NOT NULL,
  `modified_date` datetime NOT NULL,
  `active` enum('0','1') NOT NULL DEFAULT '1',
  `locked` enum('0','1') NOT NULL DEFAULT '0',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `broker_list`
--

LOCK TABLES `broker_list` WRITE;
/*!40000 ALTER TABLE `broker_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `broker_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_list`
--

DROP TABLE IF EXISTS `category_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_list` (
  `id` int unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `sort` int unsigned NOT NULL,
  `added_by` int unsigned NOT NULL,
  `added_date` datetime NOT NULL,
  `modified_by` int unsigned NOT NULL,
  `modified_date` datetime NOT NULL,
  `active` enum('0','1') NOT NULL DEFAULT '1',
  `locked` enum('0','1') NOT NULL DEFAULT '0',
  `status` enum('0','1') NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_list`
--

LOCK TABLES `category_list` WRITE;
/*!40000 ALTER TABLE `category_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `category_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `currencies`
--

DROP TABLE IF EXISTS `currencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `currencies` (
  `id` int unsigned NOT NULL,
  `abbreviation` varchar(3) NOT NULL,
  `alpha3` varchar(3) NOT NULL,
  `symbol` varchar(1) NOT NULL,
  `exchange_rate` double NOT NULL,
  `sort` int unsigned NOT NULL,
  `added_by` int unsigned NOT NULL,
  `added_date` datetime NOT NULL,
  `modified_by` int unsigned NOT NULL,
  `modified_date` datetime NOT NULL,
  `active` enum('0','1') NOT NULL DEFAULT '1',
  `locked` enum('0','1') NOT NULL DEFAULT '0',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currencies`
--

LOCK TABLES `currencies` WRITE;
/*!40000 ALTER TABLE `currencies` DISABLE KEYS */;
/*!40000 ALTER TABLE `currencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_list`
--

DROP TABLE IF EXISTS `user_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_list` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `lastname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email_verified` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0',
  `added_by` int unsigned NOT NULL,
  `added_date` datetime NOT NULL,
  `modified_by` int unsigned NOT NULL,
  `modified_date` datetime NOT NULL,
  `active` enum('0','1') NOT NULL DEFAULT '1',
  `locked` enum('0','1') NOT NULL DEFAULT '0',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  `register_ip` varchar(50) DEFAULT NULL,
  `register_date` datetime DEFAULT NULL,
  `last_seen` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_list`
--

LOCK TABLES `user_list` WRITE;
/*!40000 ALTER TABLE `user_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_partners`
--

DROP TABLE IF EXISTS `user_partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_partners` (
  `id` int NOT NULL,
  `broker_id` int unsigned NOT NULL,
  `identity` varchar(11) NOT NULL,
  `identity_verified` enum('0','1') NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `birthdate` date NOT NULL,
  `number` varchar(15) NOT NULL,
  `email` varchar(50) NOT NULL,
  `iban` char(26) NOT NULL,
  `account_holder` varchar(50) NOT NULL,
  `company_title` varchar(100) NOT NULL,
  `tax_office` varchar(50) NOT NULL,
  `tax_number` varchar(45) NOT NULL,
  `authorized_person` varchar(50) NOT NULL,
  `authorized_number` varchar(15) NOT NULL,
  `authorized_email` varchar(50) NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  `type` enum('Seller','Buyer') NOT NULL,
  `added_by` int unsigned NOT NULL,
  `added_date` datetime NOT NULL,
  `modified_by` int unsigned NOT NULL,
  `modified_date` datetime NOT NULL,
  `active` enum('0','1') NOT NULL DEFAULT '1',
  `locked` enum('0','1') NOT NULL DEFAULT '0',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `iban_UNIQUE` (`iban`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `identity_UNIQUE` (`identity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_partners`
--

LOCK TABLES `user_partners` WRITE;
/*!40000 ALTER TABLE `user_partners` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_phone_list`
--

DROP TABLE IF EXISTS `user_phone_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_phone_list` (
  `id` int NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `number` varchar(15) NOT NULL,
  `contact_selected` enum('0','1') DEFAULT NULL,
  `verified` enum('0','1') NOT NULL,
  `added_by` int unsigned NOT NULL,
  `added_date` datetime NOT NULL,
  `modified_by` int unsigned NOT NULL,
  `modified_date` datetime NOT NULL,
  `active` enum('0','1') NOT NULL DEFAULT '1',
  `locked` enum('0','1') NOT NULL DEFAULT '0',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_phone_list`
--

LOCK TABLES `user_phone_list` WRITE;
/*!40000 ALTER TABLE `user_phone_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_phone_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_phone_validations`
--

DROP TABLE IF EXISTS `user_phone_validations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_phone_validations` (
  `id` int unsigned NOT NULL,
  `user_phone_id` varchar(45) NOT NULL,
  `code` varchar(6) NOT NULL,
  `attempts` int unsigned NOT NULL,
  `expired_date` datetime NOT NULL,
  `added_by` int unsigned NOT NULL,
  `added_date` datetime NOT NULL,
  `modified_by` int unsigned NOT NULL,
  `modified_date` datetime NOT NULL,
  `active` enum('0','1') NOT NULL,
  `locked` enum('0','1') NOT NULL,
  `status` enum('0','1') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_phone_validations`
--

LOCK TABLES `user_phone_validations` WRITE;
/*!40000 ALTER TABLE `user_phone_validations` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_phone_validations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-22 16:23:06
