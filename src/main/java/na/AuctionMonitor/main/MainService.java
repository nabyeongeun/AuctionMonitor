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

import java.net.http.HttpClient;
import java.time.Duration;
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

    private List<Map<String,Object>> get(String itemCode) {

        UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromUriString(base + itemCode);

        UriComponents uriComponents = uriComponentsBuilder.build();

        log.info(String.valueOf(uriComponents.toUri()));

        ResponseEntity<List<Map<String, Object>>> response = restClient.get()
                .uri(uriComponents.toUri())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<>() {});

        return response.getBody();
    }

    public List<Map<String,Object>> request (String itemCode) {
        return get(itemCode);
    }

}
