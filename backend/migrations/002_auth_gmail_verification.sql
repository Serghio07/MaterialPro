BEGIN;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_verificacion VARCHAR(10);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_expira TIMESTAMP;
ALTER TABLE usuarios ALTER COLUMN email SET NOT NULL;
ALTER TABLE usuarios ALTER COLUMN password SET NOT NULL;
ALTER TABLE usuarios ALTER COLUMN estado SET DEFAULT 'activo';

UPDATE usuarios
SET email_verificado = true
WHERE email_verificado IS DISTINCT FROM true
  AND codigo_verificacion IS NULL;

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_usuario_key;
ALTER TABLE usuarios DROP COLUMN IF EXISTS usuario;

COMMIT;
