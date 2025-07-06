package na.AuctionMonitor.main;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.http.HttpClient;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class MainService {

    private final String base = "https://api.mapleland.gg/trade?itemCode=";
    private final RestClient restClient;

    MainService() {

        Duration timeout = Duration.ofSeconds(3);
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(timeout)
                .build();

        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(timeout);

        restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String,Object>> get(String itemCode) throws IOException {

        UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromUriString(base + itemCode);

        UriComponents uriComponents = uriComponentsBuilder.build();

        log.info(String.valueOf(uriComponents.toUri()));

        ResponseEntity<List<Map<String, Object>>> response = restClient.get()
                .uri(uriComponents.toUri())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<>() {});

        List<Map<String, Object>> body = response.getBody();

        if(body == null)
            return new ArrayList<>();

        List<String> blacklist = readBlacklist();

        int size = body.size();
        for(int i=0; i<size; i++) {

            Map<String,Object> item = body.get(i);

            String comment = (String) item.get("comment");

            if(comment == null || comment.isEmpty())
                continue;

            for(String keyword : blacklist) {
                if(comment.contains(keyword)) {
                    body.remove(i);
                    i--;
                    size--;
                    break;
                }
            }
        }

        return body;
    }

    public List<Map<String,Object>> request (String itemCode) throws IOException {
        return get(itemCode);
    }


    private final Path filePath = Paths.get(System.getProperty("user.home"), "AuctionMonitorBlacklist.txt");

    public void addBlacklist(String userId) throws IOException {
        Files.write(filePath, userId.concat("\n").getBytes(), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    }

    public List<String> readBlacklist() throws IOException {
        if (Files.exists(filePath)) {
            return Files.readAllLines(filePath);
        } else {
            return new ArrayList<>();
        }
    }

}
