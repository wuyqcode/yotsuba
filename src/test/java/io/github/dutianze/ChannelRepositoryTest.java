package io.github.dutianze;

import io.github.dutianze.cms.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * @author dutianze
 * @date 2024/7/23
 */
@SpringBootTest
class ChannelRepositoryTest {

    @Autowired
    private ChannelRepository channelRepository;
    @Autowired
    private MemoRepository memoRepository;
    @Autowired
    private CommentRepository commentRepository;

    @Test
    public void jpaTest() {
        Channel channel = new Channel("1");
        Memo memo1 = new Memo("t1");
        Memo memo2 = new Memo("t2");
//        channel.addMemo(memo2);


        channelRepository.save(channel);

        memoRepository.delete(memo1);

        System.out.println("222");


        Comment comment = new Comment("ccc", memo1);
        commentRepository.save(comment);

    }

}