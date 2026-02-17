-- Normalizar estados na tabela addresses para siglas de 2 caracteres
-- Isso corrige endereços que foram salvos com nomes completos como "São Paulo" ao invés de "SP"

UPDATE addresses 
SET state = 'AC' 
WHERE LOWER(TRIM(state)) = 'acre';

UPDATE addresses 
SET state = 'AL' 
WHERE LOWER(TRIM(state)) = 'alagoas';

UPDATE addresses 
SET state = 'AP' 
WHERE LOWER(TRIM(state)) = 'amapá';

UPDATE addresses 
SET state = 'AM' 
WHERE LOWER(TRIM(state)) = 'amazonas';

UPDATE addresses 
SET state = 'BA' 
WHERE LOWER(TRIM(state)) = 'bahia';

UPDATE addresses 
SET state = 'CE' 
WHERE LOWER(TRIM(state)) = 'ceará';

UPDATE addresses 
SET state = 'DF' 
WHERE LOWER(TRIM(state)) IN ('distrito federal', 'df');

UPDATE addresses 
SET state = 'ES' 
WHERE LOWER(TRIM(state)) = 'espírito santo';

UPDATE addresses 
SET state = 'GO' 
WHERE LOWER(TRIM(state)) = 'goiás';

UPDATE addresses 
SET state = 'MA' 
WHERE LOWER(TRIM(state)) = 'maranhão';

UPDATE addresses 
SET state = 'MT' 
WHERE LOWER(TRIM(state)) = 'mato grosso';

UPDATE addresses 
SET state = 'MS' 
WHERE LOWER(TRIM(state)) = 'mato grosso do sul';

UPDATE addresses 
SET state = 'MG' 
WHERE LOWER(TRIM(state)) = 'minas gerais';

UPDATE addresses 
SET state = 'PA' 
WHERE LOWER(TRIM(state)) = 'pará';

UPDATE addresses 
SET state = 'PB' 
WHERE LOWER(TRIM(state)) = 'paraíba';

UPDATE addresses 
SET state = 'PR' 
WHERE LOWER(TRIM(state)) = 'paraná';

UPDATE addresses 
SET state = 'PE' 
WHERE LOWER(TRIM(state)) = 'pernambuco';

UPDATE addresses 
SET state = 'PI' 
WHERE LOWER(TRIM(state)) = 'piauí';

UPDATE addresses 
SET state = 'RJ' 
WHERE LOWER(TRIM(state)) = 'rio de janeiro';

UPDATE addresses 
SET state = 'RN' 
WHERE LOWER(TRIM(state)) = 'rio grande do norte';

UPDATE addresses 
SET state = 'RS' 
WHERE LOWER(TRIM(state)) = 'rio grande do sul';

UPDATE addresses 
SET state = 'RO' 
WHERE LOWER(TRIM(state)) = 'rondônia';

UPDATE addresses 
SET state = 'RR' 
WHERE LOWER(TRIM(state)) = 'roraima';

UPDATE addresses 
SET state = 'SC' 
WHERE LOWER(TRIM(state)) = 'santa catarina';

UPDATE addresses 
SET state = 'SP' 
WHERE LOWER(TRIM(state)) = 'são paulo';

UPDATE addresses 
SET state = 'SE' 
WHERE LOWER(TRIM(state)) = 'sergipe';

UPDATE addresses 
SET state = 'TO' 
WHERE LOWER(TRIM(state)) = 'tocantins';

-- Garantir que estados já estejam em uppercase (caso já estivessem em sigla mas minúsculas)
UPDATE addresses 
SET state = UPPER(state)
WHERE LENGTH(state) = 2;
