FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 创建 DB 目录
RUN mkdir -p /app/db

# 拷贝本地构建好的 JAR
COPY target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar", "--spring.profiles.active=prod"]