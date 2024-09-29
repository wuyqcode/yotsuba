package io.github.dutianze.file;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * @author dutianze
 * @date 2024/9/16
 */
@Component
public class FileResourceEventListener {

    private static final Logger logger = LoggerFactory.getLogger(FileResourceEventListener.class);

    private final FileResourceRepository fileResourceRepository;

    public FileResourceEventListener(FileResourceRepository fileResourceRepository) {
        this.fileResourceRepository = fileResourceRepository;
    }

    @ApplicationModuleListener
    public void handle(FileResourceReferenceRemovedEvent event) {
        logger.info("Handling FileResourceReferenceRemovedEvent for event:{}", event);

        FileResource fileResource = getFileResourceOrLogAndReturn(event.fileResourceId());
        if (fileResource == null) {
            return;
        }

        fileResource.removeReference();
        fileResourceRepository.save(fileResource);
        logger.info("Reference removed for resourceId: {}", event.fileResourceId());
    }

    @ApplicationModuleListener
    public void handle(FileResourceReferenceAddedEvent event) {
        logger.info("Handling FileResourceReferenceAddedEvent for event:{}", event);

        FileResource fileResource = getFileResourceOrLogAndReturn(event.fileResourceId());
        if (fileResource == null) {
            return;
        }

        fileResource.linkReference(new ReferenceInfo(event.fileReferenceId(), event.referenceType()));
        fileResourceRepository.save(fileResource);
        logger.info("Reference added for resourceId: {}", event.fileResourceId());
    }

    private FileResource getFileResourceOrLogAndReturn(FileResourceId fileResourceId) {
        Optional<FileResource> fileResourceOptional = fileResourceRepository.findById(fileResourceId);
        if (fileResourceOptional.isEmpty()) {
            logger.info("No reference found for fileResourceId: {}", fileResourceId);
            return null;
        }
        return fileResourceOptional.get();
    }
}
