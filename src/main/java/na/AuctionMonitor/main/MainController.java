package na.AuctionMonitor.main;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class MainController {

    private final MainService service;

    @GetMapping("/request/{itemCode}")
    public List<Map<String,Object>> request(@PathVariable String itemCode) {
        return service.request(itemCode);
    }
}
