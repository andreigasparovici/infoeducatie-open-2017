CREATE TABLE `users` (
	`id` int NOT NULL,
	`email` varchar(50) NOT NULL UNIQUE,
	`password` varchar(200) NOT NULL,
	`is_teacher` INT(5) NOT NULL DEFAULT '0',
	`name` varchar(50) NOT NULL,
	`is_activated` int(5) NOT NULL DEFAULT '0',
	PRIMARY KEY (`id`)
);

CREATE TABLE `problems` (
	`id` int NOT NULL,
	`text` TEXT NOT NULL,
	`level` varchar(30) NOT NULL DEFAULT 'usor',
	PRIMARY KEY (`id`)
);

CREATE TABLE `tests` (
	`id` int NOT NULL,
	`input` TEXT NOT NULL,
	`output` TEXT NOT NULL,
	`problem_id` int NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `lessons` (
	`id` int NOT NULL,
	`author`  NOT NULL,
	`content` TEXT NOT NULL,
	`date_added` DATETIME,
	PRIMARY KEY (`id`)
);

CREATE TABLE `results` (
	`id` int NOT NULL,
	`user_id`  NOT NULL,
	`problem_id`  NOT NULL,
	`points` int DEFAULT '-1',
	PRIMARY KEY (`id`)
);

CREATE TABLE `code_sharing` (
	`id` INT NOT NULL AUTO_INCREMENT UNIQUE,
	`xml_code` TEXT NOT NULL,
	PRIMARY KEY (`id`)
);

ALTER TABLE `tests` ADD CONSTRAINT `tests_fk0` FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`);

ALTER TABLE `lessons` ADD CONSTRAINT `lessons_fk0` FOREIGN KEY (`author`) REFERENCES `users`(`id`);

ALTER TABLE `results` ADD CONSTRAINT `results_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);

ALTER TABLE `results` ADD CONSTRAINT `results_fk1` FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`);

