package com.email.writer;


import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://mail.google.com"
})
@RestController
@AllArgsConstructor
@RequestMapping("/api/email")
public class EmailGeneratorController {


    private final EmailGeneratorService emailGeneratorService;
    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail (@RequestBody EmailRequest emailRequest) {
        String response =  emailGeneratorService.generateEmailReply(emailRequest);
        return ResponseEntity.ok( response);
    }
}
