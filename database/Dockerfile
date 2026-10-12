FROM mysql:8.0
# Schema is baked into the image (no host bind mount) so it also works when
# compose is run from inside the Jenkins container.
COPY schema.sql /docker-entrypoint-initdb.d/schema.sql
