-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: meat_inventory
-- ------------------------------------------------------
-- Server version	8.0.44-0ubuntu0.24.04.1

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
-- Table structure for table `inventory_logs`
--

DROP TABLE IF EXISTS `inventory_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `changed_by_id` int NOT NULL,
  `change_type` enum('purchase','deduction','adjustment') NOT NULL,
  `quantity_change` int NOT NULL,
  `old_stock` int NOT NULL,
  `new_stock` int NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `changed_by` varchar(30) DEFAULT NULL,
  `user_role` enum('staff','manager','admin') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `changed_by` (`changed_by_id`),
  CONSTRAINT `inventory_logs_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `inventory_logs_ibfk_2` FOREIGN KEY (`changed_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_logs`
--

LOCK TABLES `inventory_logs` WRITE;
/*!40000 ALTER TABLE `inventory_logs` DISABLE KEYS */;
INSERT INTO `inventory_logs` VALUES (4,15,3,'purchase',2,0,2,'2025-11-28 22:54:19','sushant','manager'),(5,15,3,'adjustment',2,2,0,'2025-11-28 22:56:13','sushant','manager'),(6,15,3,'adjustment',2,2,0,'2025-11-28 23:05:35','sushant','manager'),(7,15,3,'purchase',2,2,4,'2025-11-28 23:14:02','sushant','manager'),(8,15,3,'purchase',4,4,8,'2025-11-28 23:15:21','sushant','manager'),(9,15,3,'purchase',10,8,18,'2025-11-28 23:15:59','sushant','manager'),(10,15,3,'deduction',4,18,14,'2025-11-28 23:18:46','sushant','manager'),(11,15,3,'purchase',10,14,24,'2025-11-28 23:19:49','sushant','manager'),(12,15,3,'deduction',4,24,20,'2025-11-28 23:22:03','sushant','manager'),(13,11,3,'deduction',4,5,1,'2025-11-28 23:32:21','sushant','manager'),(14,11,3,'purchase',10,1,11,'2025-11-29 01:21:29','sushant','manager'),(15,4,3,'adjustment',5,5,0,'2025-11-29 10:34:57','sushant','manager');
/*!40000 ALTER TABLE `inventory_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `current_stock` int NOT NULL DEFAULT '0',
  `price_per_unit` decimal(10,2) DEFAULT NULL,
  `low_stock_threshold` decimal(10,2) DEFAULT '5.00',
  `expiry_date` date DEFAULT NULL,
  `unit` enum('kg','half_kg','dozen','piece') DEFAULT NULL,
  `category` enum('fish','chicken','goat','pork','beef','egg') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (4,'chicken leg piece',5,120.00,5.00,NULL,'kg','chicken',0),(11,'eggs',11,500.00,5.00,NULL,'dozen','egg',1),(12,'pork sekuwa',10,150.00,5.00,NULL,'kg','pork',1),(13,'mutton',22,700.00,5.00,NULL,'kg','goat',1),(15,'chicken breast',20,340.00,5.00,NULL,'kg','chicken',1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT NULL,
  `purchase_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by_id` int NOT NULL,
  `supplier_name` varchar(30) DEFAULT 'pushkar poultry',
  `created_by` varchar(30) DEFAULT NULL,
  `product_name` varchar(30) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_product` (`product_id`),
  KEY `fk_created_by` (`created_by_id`),
  CONSTRAINT `fk_created_by` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES (3,11,5,'2025-11-28 18:35:49',3,'pushkar poultry','manager','eggs',NULL),(4,12,10,'2025-11-28 19:14:01',3,'pushkar poultry','manager','pork sekuwa','2025-12-01'),(5,13,22,'2025-11-28 20:10:50',3,'pushkar poultry','manager','mutton','2025-12-05'),(7,15,2,'2025-11-28 22:54:19',3,'pushkar poultry','manager','chicken breast','2025-12-01');
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(15) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','manager','staff') NOT NULL DEFAULT 'staff',
  `lastname` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'sushant','test@gmail.com','$2b$08$RFCuGhUzi3knuNgml9yjs.dxHeAg7qwgMek8Tw1yN/ydBsIPvfVGq','staff','pokhrel'),(3,'sushant','manager1@gmail.com','$2b$08$6wFhLFJA8dSuQ3wNpN7Y3.Cz8Un1tfZfBIU0OhvYLKcOXLWT/.wbO','manager','pok'),(4,'raju','user@gmail.com','$2b$08$hb1mKGObc3C9PiPOArwyluiqWHIaPXAQ/3zNSOJhx02ko.r8XaIAe','staff','adhikari');
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

-- Dump completed on 2025-11-29 11:08:00
