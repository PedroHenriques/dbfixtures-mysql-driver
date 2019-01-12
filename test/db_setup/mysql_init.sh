#!/bin/sh

mysql -u"root" -p"" -e "CREATE DATABASE IF NOT EXISTS fixtures_test;"
mysql -u"root" -p"" -e "CREATE TABLE fixtures_test.roles (id INT AUTO_INCREMENT, name VARCHAR(100) NULL, PRIMARY KEY(id));"
mysql -u"root" -p"" -e "CREATE TABLE fixtures_test.users (id INT AUTO_INCREMENT, email VARCHAR(150) NOT NULL, role_id INT NOT NULL, PRIMARY KEY(id), FOREIGN KEY (role_id) REFERENCES fixtures_test.roles(id));"