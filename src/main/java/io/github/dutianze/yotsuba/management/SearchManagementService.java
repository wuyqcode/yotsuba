package io.github.dutianze.yotsuba.management;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.file.config.FileDataSourceConfig;
import io.github.dutianze.yotsuba.search.NoteSearch;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * 索引管理服务
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

    private final NoteSearch noteSearch;
    private final DataSource fileDataSource;

    public SearchManagementService(NoteSearch noteSearch,
                                   @Qualifier(FileDataSourceConfig.DATASOURCE) DataSource fileDataSource) {
        this.noteSearch = noteSearch;
        this.fileDataSource = fileDataSource;
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
            noteSearch.reindexAll(async);
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
     * 执行 SQLite VACUUM 操作以减小数据库文件大小
     * 当数据被删除或设置为 null 后，SQLite 不会立即释放空间，需要执行 VACUUM 来回收空间
     * 
     * 注意：VACUUM 会重建整个数据库文件，可能需要较长时间，且需要独占数据库连接
     *
     * @return 操作结果消息
     */
    public String vacuumFileDatabase() {
        log.info("开始执行 VACUUM 操作以减小数据库文件大小");
        try {
            long startTime = System.currentTimeMillis();
            try (Connection connection = fileDataSource.getConnection();
                 Statement statement = connection.createStatement()) {
                statement.execute("VACUUM");
            }
            long duration = System.currentTimeMillis() - startTime;
            String message = String.format("VACUUM 操作完成，耗时 %d 毫秒", duration);
            log.info(message);
            return message;
        } catch (Exception e) {
            log.error("VACUUM 操作失败", e);
            return "VACUUM 操作失败: " + e.getMessage();
        }
    }

    /**
     * 索引状态记录
     */
    public record IndexStatus(
        String status,
        long timestamp
    ) {}
}

