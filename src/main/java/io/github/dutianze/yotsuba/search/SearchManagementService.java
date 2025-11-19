package io.github.dutianze.yotsuba.search;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Hibernate Search 管理服务
 * 提供索引重建等管理功能
 *
 * @author dutianze
 * @date 2025/01/19
 */
@Slf4j
@Service
@Endpoint
@AnonymousAllowed
public class SearchManagementService {

    private final HibernateSearch hibernateSearch;

    public SearchManagementService(NoteSearch noteSearch) {
        this.hibernateSearch = noteSearch;
    }

    /**
     * 重建所有索引
     *
     * @param async true:异步执行, false:同步执行
     * @return 操作结果消息
     */
    @Transactional
    public String reindexAll(boolean async) {
        log.info("开始重建索引, 异步模式: {}", async);
        try {
            hibernateSearch.reindexAll(async);
            String message = async ? "索引重建已在后台启动" : "索引重建完成";
            log.info(message);
            return message;
        } catch (Exception e) {
            log.error("索引重建失败", e);
            return "索引重建失败: " + e.getMessage();
        }
    }

    /**
     * 获取索引状态信息
     *
     * @return 状态信息
     */
    public IndexStatus getIndexStatus() {
        // 这里可以根据实际需求返回索引的统计信息
        return new IndexStatus(
            "运行中",
            System.currentTimeMillis()
        );
    }

    /**
     * 索引状态记录
     */
    public record IndexStatus(
        String status,
        long timestamp
    ) {}
}

