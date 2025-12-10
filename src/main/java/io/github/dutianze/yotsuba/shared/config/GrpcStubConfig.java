package io.github.dutianze.yotsuba.shared.config;

import io.github.dutianze.yotsuba_grpc.proto.TextProcessorGrpc;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.grpc.client.GrpcChannelFactory;

@Slf4j
@Configuration
public class GrpcStubConfig {


    @Value("${yotsuba.grpc.address}")
    private String address;
    @Value("${yotsuba.grpc.port}")
    private int port;

    @Bean
    TextProcessorGrpc.TextProcessorBlockingStub stub(GrpcChannelFactory channels) {
        String target = address + ":" + port;
        log.info("gRPC connecting to: {}", target);

        return TextProcessorGrpc.newBlockingStub(channels.createChannel(target));
    }
}