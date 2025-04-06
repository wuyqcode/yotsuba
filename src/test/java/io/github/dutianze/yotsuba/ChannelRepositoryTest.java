package io.github.dutianze.yotsuba;

import io.github.dutianze.yotsuba.cms.domain.Post;
import io.github.dutianze.yotsuba.cms.domain.PostRepository;
import io.github.dutianze.yotsuba.cms.domain.Tag;
import io.github.dutianze.yotsuba.cms.domain.valueobject.PostTitle;
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
    private PostRepository postRepository;

    @Test
    public void jpaTest() {

        Post post = new Post(new PostTitle("555"), new Tag("44"));
        postRepository.save(post);
    }

}