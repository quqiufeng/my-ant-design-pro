-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: project
-- ------------------------------------------------------
-- Server version	8.0.44-0ubuntu0.24.04.2

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
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `role_id` int NOT NULL COMMENT '角色ID',
  PRIMARY KEY (`id`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_admin_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='管理员表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (2,'admin','13800138000','$2y$12$/rWgDSRlAnWO7QTmavLEi.zFW8/NKeM8/GNexBkGFVYofRJvXM5Fa',NULL,1),(3,'qqqqq',NULL,'$2y$12$rfDbyI3YZOaCUViUvn/LUeZewvbw7Z2fEfllRXIHIxQ4ZkBv0EzvC',NULL,44);
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name` varchar(50) NOT NULL COMMENT '角色名',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'超级管理员'),(6,'普通管理员1'),(7,'内容审核员'),(8,'用户管理员'),(9,'财务管理员'),(10,'订单管理员'),(11,'商品管理员'),(12,'营销管理员'),(13,'数据分析师'),(14,'客服专员'),(16,'技术总监'),(17,'产品经理'),(18,'UI设计师'),(19,'前端工程师'),(20,'后端工程师'),(21,'测试工程师'),(22,'运维工程师'),(23,'数据库管理员'),(24,'安全工程师'),(25,'架构师'),(26,'项目经理'),(27,'法务专员'),(28,'人事专员'),(29,'行政专员'),(30,'采购专员'),(31,'物流专员'),(32,'仓储专员'),(33,'质量管理员'),(34,'售后专员'),(35,'公关专员'),(36,'品牌专员'),(37,'媒介专员'),(38,'文案策划'),(39,'视觉设计师'),(40,'交互设计师'),(41,'用户研究员'),(42,'数据工程师'),(43,'算法工程师'),(44,'AI工程师'),(45,'区块链工程师1'),(46,'云计算工程师'),(47,'大数据工程师'),(48,'移动端工程师'),(53,'test');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_menu`
--

DROP TABLE IF EXISTS `role_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_menu` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_id` int NOT NULL COMMENT '角色ID',
  `path` varchar(100) NOT NULL COMMENT '路径',
  PRIMARY KEY (`id`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_role_menu_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色路径对应表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_menu`
--

LOCK TABLES `role_menu` WRITE;
/*!40000 ALTER TABLE `role_menu` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_menu`
--

DROP TABLE IF EXISTS `system_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_menu` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(50) NOT NULL COMMENT '菜单名称',
  `title` varchar(100) DEFAULT '',
  `path` varchar(200) NOT NULL COMMENT '路由路径',
  `redirect` varchar(200) DEFAULT '' COMMENT '重定向路径',
  `icon` varchar(50) DEFAULT '' COMMENT '图标',
  `sort` int DEFAULT '0' COMMENT '排序',
  `is_visible` tinyint(1) DEFAULT '1' COMMENT '是否显示',
  `is_single` tinyint(1) DEFAULT '0' COMMENT '是否单页 (0=否, 1=是)',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态',
  PRIMARY KEY (`id`),
  KEY `idx_path` (`path`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统菜单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_menu`
--

LOCK TABLES `system_menu` WRITE;
/*!40000 ALTER TABLE `system_menu` DISABLE KEYS */;
INSERT INTO `system_menu` VALUES (1,'dashboard','仪表盘','/dashboard','','dashboard',1,1,0,1),(2,'form','表单页','/form','','form',2,1,0,1),(3,'list','列表页','/list','','table',3,1,0,1),(4,'profile','详情页','/profile','','profile',4,1,0,1),(5,'result','结果页','/result','','CheckCircleOutlined',5,1,0,1),(6,'exception','异常页','/exception','','warning',6,1,0,1),(7,'account','个人中心','/account','','user',7,1,0,1),(8,'analysis','分析页','/dashboard/analysis','','smile',1,1,0,1),(9,'monitor','监控页','/dashboard/monitor','','smile',2,1,0,1),(10,'workplace','工作台','/dashboard/workplace','','smile',3,1,0,1),(11,'basic-form','基础表单','/form/basic-form','','smile',1,1,0,1),(12,'step-form','分步表单','/form/step-form','','smile',2,1,0,1),(13,'advanced-form','高级表单','/form/advanced-form','','smile',3,1,0,1),(14,'search-list','搜索列表','/list/search','','smile',1,1,0,1),(15,'table-list','查询表格','/list/table-list','','smile',2,1,0,1),(16,'basic-list','标准列表','/list/basic-list','','smile',3,1,0,1),(17,'card-list','卡片列表','/list/card-list','','smile',4,1,0,1),(18,'basic','基础详情页','/profile/basic','','smile',1,1,0,1),(19,'advanced','高级详情页','/profile/advanced','','smile',2,1,0,1),(20,'success','成功页','/result/success','','smile',1,1,0,1),(21,'fail','失败页','/result/fail','','smile',2,1,0,1),(22,'403','403','/exception/403','','smile',1,1,0,1),(23,'404','404','/exception/404','','smile',2,1,0,1),(24,'500','500','/exception/500','','smile',3,1,0,1),(25,'account-center','个人中心','/account/center','','smile',1,1,0,1),(26,'settings','个人设置','/account/settings','','smile',2,1,0,1),(27,'articles','文章列表','/list/search/articles','','smile',1,1,0,1),(28,'projects','项目列表','/list/search/projects','','smile',2,1,0,1),(29,'applications','应用列表','/list/search/applications','','smile',3,1,0,1),(32,'admin','管理员','/admin','','user',8,1,0,1),(33,'role','角色管理','/admin/role','','team',1,1,0,1),(34,'admin-list','管理员列表','/admin/admin-list','','solution',2,1,0,1);
/*!40000 ALTER TABLE `system_menu` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-01 11:29:36
