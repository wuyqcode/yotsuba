package io.github.dutianze.cms;

import io.github.dutianze.cms.valueobject.MemoContent;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToMany;
import org.jmolecules.ddd.types.AggregateRoot;
import org.jmolecules.ddd.types.Association;
import org.springframework.data.domain.AbstractAggregateRoot;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * @author dutianze
 * @date 2023/8/11
 */
public class Memo extends AbstractAggregateRoot<Memo> implements AggregateRoot<Memo, MemoId> {

    private MemoId id;

    private String title;

    private List<MemoCover> cover = new ArrayList<>();

    private List<MemoContent> content;

    private Association<Channel, ChannelId> channel;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    private SortedSet<Tag> tags;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Memo(String title, List<String> covers, String content) {
        this.id = new MemoId();
        this.title = title;
        this.cover = covers.stream().map(MemoCover::new).collect(Collectors.toList());
        this.content = List.of(new MemoContent(content));
    }

    public Memo(String m1) {
        this.title = m1;
        this.id = new MemoId();
        this.content = List.of(new MemoContent("666"));
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public Memo(Channel channel, String m1, Tag... tags) {
        this(m1);
        this.tags = new TreeSet<>(List.of(tags));
        this.channel = Association.forAggregate(channel);
    }

    @Override
    public MemoId getId() {
        return id;
    }
}