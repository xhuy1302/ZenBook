package com.haui.ZenBook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZenBookApplication {

	public static void main(String[] args) {
		SpringApplication.run(ZenBookApplication.class, args);
	}

}
