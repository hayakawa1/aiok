-- MySQL dump 10.13  Distrib 9.1.0, for macos15.2 (arm64)
--
-- Host: localhost    Database: aiok
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
INSERT INTO `alembic_version` VALUES ('83adb8b7da41');
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_user_request_stats`
--

DROP TABLE IF EXISTS `daily_user_request_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_user_request_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `user_id` int NOT NULL,
  `role` varchar(20) NOT NULL,
  `status` varchar(50) NOT NULL,
  `count` int NOT NULL,
  `total_amount` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `daily_user_request_stats_unique` (`date`,`user_id`,`role`,`status`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `daily_user_request_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_user_request_stats`
--

LOCK TABLES `daily_user_request_stats` WRITE;
/*!40000 ALTER TABLE `daily_user_request_stats` DISABLE KEYS */;
INSERT INTO `daily_user_request_stats` VALUES (11,'2025-01-20',1,'requester','pending',1,10000,'2025-01-21 15:07:33','2025-01-21 15:07:33'),(12,'2025-01-20',1,'requester','accepted',1,20000,'2025-01-21 15:07:33','2025-01-21 15:07:33'),(13,'2025-01-20',1,'requester','delivered',1,15000,'2025-01-21 15:07:33','2025-01-21 15:07:33'),(14,'2025-01-20',2,'requester','delivered',1,10000,'2025-01-21 15:07:33','2025-01-21 15:07:33'),(15,'2025-01-20',2,'requester','rejected',1,5000,'2025-01-21 15:07:33','2025-01-21 15:07:33'),(16,'2025-01-20',1,'receiver','delivered',1,10000,'2025-01-21 15:07:33','2025-01-21 15:07:33'),(17,'2025-01-20',1,'receiver','rejected',1,5000,'2025-01-21 15:07:33','2025-01-21 15:07:33'),(18,'2025-01-20',2,'receiver','pending',1,10000,'2025-01-21 15:07:33','2025-01-21 15:07:33'),(19,'2025-01-20',2,'receiver','accepted',1,20000,'2025-01-21 15:07:33','2025-01-21 15:07:33'),(20,'2025-01-20',2,'receiver','delivered',1,15000,'2025-01-21 15:07:33','2025-01-21 15:07:33');
/*!40000 ALTER TABLE `daily_user_request_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_plans`
--

DROP TABLE IF EXISTS `price_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `price_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_plans`
--

LOCK TABLES `price_plans` WRITE;
/*!40000 ALTER TABLE `price_plans` DISABLE KEYS */;
INSERT INTO `price_plans` VALUES (1,2,'http://localhost:8080/hayakawahiroshi197','http://localhost:8080/hayakawahiroshi19771103',100,'2025-01-21 06:09:27','2025-01-21 06:09:27');
/*!40000 ALTER TABLE `price_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requests`
--

DROP TABLE IF EXISTS `requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requester_id` int NOT NULL,
  `receiver_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` int NOT NULL,
  `status` varchar(50) NOT NULL,
  `plan_title` varchar(255) DEFAULT NULL,
  `plan_description` text,
  `delivered_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `delivery_url` varchar(255) DEFAULT NULL,
  `delivery_comment` text,
  `creation_ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `receiver_id` (`receiver_id`),
  KEY `requester_id` (`requester_id`),
  CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`),
  CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests`
--

LOCK TABLES `requests` WRITE;
/*!40000 ALTER TABLE `requests` DISABLE KEYS */;
INSERT INTO `requests` VALUES (11,1,2,'テスト依頼1','テスト内容1',10000,'pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-01-20 10:00:00','2025-01-20 11:00:00'),(12,1,2,'テスト依頼2','テスト内容2',20000,'delivered',NULL,NULL,'2025-01-21 06:22:36',NULL,'deliveries/b74cf0d0-2499-4074-9608-31c156bde571-6344932C_76E4_4E41_BB6E_5F42E04EACD9_gogh.jpeg',NULL,'',NULL,'2025-01-20 12:00:00','2025-01-21 15:21:51'),(13,1,2,'テスト依頼3','テスト内容3',15000,'delivered',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-01-20 14:00:00','2025-01-20 15:00:00'),(14,2,1,'テスト依頼4','テスト内容4',10000,'delivered',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-01-20 16:00:00','2025-01-20 17:00:00'),(15,2,1,'テスト依頼5','テスト内容5',5000,'rejected',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-01-20 18:00:00','2025-01-20 19:00:00'),(16,1,2,'http://localhost:8080/hayakawahiroshi19771103','http://localhost:8080/hayakawahiroshi19771103',100,'accepted','http://localhost:8080/hayakawahiroshi197','http://localhost:8080/hayakawahiroshi19771103',NULL,NULL,NULL,NULL,NULL,'127.0.0.1','2025-01-21 14:58:26','2025-01-21 15:21:51');
/*!40000 ALTER TABLE `requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `total_user_request_stats`
--

DROP TABLE IF EXISTS `total_user_request_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `total_user_request_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `role` varchar(20) NOT NULL,
  `status` varchar(50) NOT NULL,
  `count` int NOT NULL,
  `total_amount` int NOT NULL,
  `first_occurrence` datetime NOT NULL,
  `last_occurrence` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `total_user_request_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `total_user_request_stats`
--

LOCK TABLES `total_user_request_stats` WRITE;
/*!40000 ALTER TABLE `total_user_request_stats` DISABLE KEYS */;
INSERT INTO `total_user_request_stats` VALUES (11,1,'requester','pending',1,10000,'2025-01-21 15:07:33','2025-01-21 15:07:33','2025-01-21 06:07:33','2025-01-21 06:07:33'),(12,1,'requester','accepted',1,20000,'2025-01-21 15:07:33','2025-01-21 15:07:33','2025-01-21 06:07:33','2025-01-21 06:07:33'),(13,1,'requester','delivered',1,15000,'2025-01-21 15:07:33','2025-01-21 15:07:33','2025-01-21 06:07:33','2025-01-21 06:07:33'),(14,2,'requester','completed',1,10000,'2025-01-21 15:07:33','2025-01-21 15:07:33','2025-01-21 06:07:33','2025-01-21 06:07:33'),(15,2,'requester','rejected',1,5000,'2025-01-21 15:07:33','2025-01-21 15:07:33','2025-01-21 06:07:33','2025-01-21 06:07:33'),(16,1,'receiver','completed',1,10000,'2025-01-21 15:07:33','2025-01-21 15:07:33','2025-01-21 06:07:33','2025-01-21 06:07:33'),(17,1,'receiver','rejected',1,5000,'2025-01-21 15:07:33','2025-01-21 15:07:33','2025-01-21 06:07:33','2025-01-21 06:07:33'),(18,2,'receiver','pending',1,10000,'2025-01-21 15:07:33','2025-01-21 15:07:33','2025-01-21 06:07:33','2025-01-21 06:07:33'),(19,2,'receiver','accepted',1,20000,'2025-01-21 15:07:33','2025-01-21 15:07:33','2025-01-21 06:07:33','2025-01-21 06:07:33'),(20,2,'receiver','delivered',1,15000,'2025-01-21 15:07:33','2025-01-21 15:07:33','2025-01-21 06:07:33','2025-01-21 06:07:33');
/*!40000 ALTER TABLE `total_user_request_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `display_name` varchar(140) NOT NULL,
  `username` varchar(255) NOT NULL,
  `google_id` varchar(255) NOT NULL,
  `stripe_account_id` varchar(255) DEFAULT NULL,
  `bio` text,
  `portfolio_url` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `banner_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'aiok.jp2025@gmail.com','ai ok','aiokjp2025','114819389739364178751',NULL,NULL,NULL,NULL,NULL,'2025-01-21 05:58:43','2025-01-21 05:58:43'),(2,'hayakawahiroshi19771103@gmail.com','Hiroshi Hayakawa','hayakawahiroshi19771103','108784013721910158323',NULL,'get_db_session()を削除する','','/static/uploads/avatars/107b9464-2fc0-413d-bd27-f74443183f61.png','/static/uploads/banners/3a805a59-cf48-484b-8645-40b14939c1ed.jpeg','2025-01-21 05:58:54','2025-01-21 05:58:54');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-21 17:43:30
