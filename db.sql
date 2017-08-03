CREATE TABLE `users` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`email` varchar(50) NOT NULL UNIQUE,
	`password` varchar(200) NOT NULL,
	`is_teacher` BOOLEAN NOT NULL DEFAULT '0',
	PRIMARY KEY (`id`)
);

CREATE TABLE `problems` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`text` TEXT NOT NULL,
	`level` varchar(30) NOT NULL DEFAULT 'usor',
	PRIMARY KEY (`id`)
);

CREATE TABLE `tests` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`input` TEXT NOT NULL,
	`output` TEXT NOT NULL,
	`problem_id` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `lessons` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`author` INT NOT NULL,
	`content` TEXT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `results` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`problem_id` INT NOT NULL,
	`user_id` INT NOT NULL,
	`points` INT DEFAULT '-1',
	PRIMARY KEY (`id`)
);

ALTER TABLE `tests` ADD CONSTRAINT `tests_fk0` FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`);

ALTER TABLE `lessons` ADD CONSTRAINT `lessons_fk0` FOREIGN KEY (`author`) REFERENCES `users`(`id`);

ALTER TABLE `results` ADD CONSTRAINT `results_fk0` FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`);

ALTER TABLE `results` ADD CONSTRAINT `results_fk1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);


