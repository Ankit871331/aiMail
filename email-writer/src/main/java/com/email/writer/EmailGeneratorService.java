package com.email.writer;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemimi.api.url}")
    private String GeminiApiURL;

    @Value("${gemimi.api.key}")
    private String GeminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {
//build the promt
        String promt = buildPromt(emailRequest);

        // Craft a promt

        Map<String, Object>requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", promt)
                        })
                }
        );

        //do request and get response

        String response = webClient.post()
                .uri(GeminiApiURL + GeminiApiKey)
                .header("Contant-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono( String.class)
                .block();


        //Extract response and return

        return extractResponseContant(response);
    }

    private String extractResponseContant(String response) {


        //need to ask

        try {

                ObjectMapper mapper = new ObjectMapper();
                JsonNode rootNode = mapper.readTree(response);
                return rootNode.path("candidates")
                        .get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText();


        } catch (Exception e){
            return "Error is showing in EmailGeneratorService.java file : "  + e.getMessage();
        }



    }

    private String buildPromt(EmailRequest emailRequest) {
        StringBuilder promt = new StringBuilder();
        promt.append("generate a profactional email reply for the following email content. Please do not generate the subject line.  ");

        if(emailRequest.getTone() != null && !emailRequest.getTone().isEmpty() ){
            promt.append("Use a ").append(emailRequest.getTone()).append(" tone.");
        }
        promt.append("\nOriginal email: \n").append(emailRequest.getEmailContent());
        return promt.toString();
    }
}
