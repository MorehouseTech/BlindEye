CREATE TABLE `Queries`(
    `query_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `business_id` BIGINT UNSIGNED NOT NULL,
    `batch_id` BIGINT UNSIGNED NOT NULL,
    `model` VARCHAR(255) NOT NULL,
    `prompt` LONGTEXT NOT NULL,
    `output` LONGTEXT NOT NULL
);
CREATE TABLE `Business`(
    `business_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `bio` LONGTEXT NOT NULL,
    `hq_location` VARCHAR(255) NOT NULL,
    `competitors` VARCHAR(255) NOT NULL,
    `tags` TEXT NOT NULL
);
CREATE TABLE `Analytics`(
    `analytic_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `query_id` BIGINT UNSIGNED NOT NULL,
    `mention_count` BIGINT NOT NULL,
    `mention_position` BIGINT NOT NULL,
    `rec_strength` DOUBLE NOT NULL,
    `sentiment` DOUBLE NOT NULL,
    `product_accuracy` DOUBLE NOT NULL,
    `feature_coverage` DOUBLE NOT NULL,
    `hallucinations` BIGINT NOT NULL
);
CREATE TABLE `Credit_Score_Events`(
    `event_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `event_time` DATETIME NOT NULL,
    `amount` BIGINT NOT NULL,
    `business_id` BIGINT UNSIGNED NOT NULL
);
ALTER TABLE
    `Credit_Score_Events` ADD CONSTRAINT `credit_score_events_business_id_foreign` FOREIGN KEY(`business_id`) REFERENCES `Business`(`business_id`);
ALTER TABLE
    `Queries` ADD CONSTRAINT `queries_business_id_foreign` FOREIGN KEY(`business_id`) REFERENCES `Business`(`business_id`);
ALTER TABLE
    `Analytics` ADD CONSTRAINT `analytics_query_id_foreign` FOREIGN KEY (`query_id`) REFERENCES `Queries`(`query_id`);