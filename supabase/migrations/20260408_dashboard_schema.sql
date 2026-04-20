-- Dashboard de Control - Fidelf
-- Creado: 2026-04-08

-- 1. Licitaciones
CREATE TABLE IF NOT EXISTS licitaciones (
    id SERIAL PRIMARY KEY,
    codigo TEXT,
    nombre TEXT,
    monto NUMERIC,
    estado TEXT DEFAULT 'publicada',
    region TEXT DEFAULT 'Coquimbo',
    url TEXT,
    fecha_publicacion DATE,
    categoria TEXT,
    proveedor TEXT,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tareas
CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
    prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
    categoria TEXT,
    fecha_limite DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Métricas Salud (Expanded for InBody integration)
CREATE TABLE IF NOT EXISTS metricas_salud (
    id SERIAL PRIMARY KEY,

    -- Basic metrics
    peso NUMERIC(5,2),
    grasa NUMERIC(5,2),
    fc_reposo NUMERIC(3),

    -- InBody comprehensive metrics
    masa_muscular NUMERIC(5,2),        -- Muscle mass
    masa_grasa NUMERIC(5,2),          -- Fat mass
    agua_corporal NUMERIC(5,2),       -- Body water (liters)
    proteinas NUMERIC(5,2),           -- Proteins
    minerales NUMERIC(5,2),           -- Minerals
    imc NUMERIC(5,2),                 -- BMI
    porcentaje_grasa NUMERIC(5,2),    -- Fat percentage
    grasa_visceral NUMERIC(3),        -- Visceral fat level
    puntuacion_inbody NUMERIC(3),     -- InBody score (0-100)

    -- Investigation parameters
    tmb NUMERIC(4),                   -- Basal metabolic rate
    relacion_cintura_cadera NUMERIC(4,3), -- Waist-hip ratio
    grado_obesidad NUMERIC(5,2),      -- Obesity degree (%)

    -- Control parameters
    peso_objetivo NUMERIC(5,2),       -- Target weight
    control_peso NUMERIC(5,2),        -- Weight control
    control_grasa NUMERIC(5,2),       -- Fat control
    control_muscular NUMERIC(5,2),    -- Muscle control

    -- Personal info
    altura NUMERIC(3),                -- Height (cm)
    edad NUMERIC(3),                  -- Age
    genero TEXT,                      -- Gender

    -- Metadata
    fecha_registro DATE DEFAULT CURRENT_DATE,
    fuente TEXT DEFAULT 'manual',     -- 'manual' or 'inbody'
    notas TEXT,                       -- Additional notes
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Métricas Running
CREATE TABLE IF NOT EXISTS metricas_running (
    id SERIAL PRIMARY KEY,
    distancia_km NUMERIC(6,2),
    tiempo_min NUMERIC(6,2),
    ritmo_km NUMERIC(5,2),
    fc_promedio NUMERIC(3),
    fecha_entreno DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Métricas Gym
CREATE TABLE IF NOT EXISTS metricas_gym (
    id SERIAL PRIMARY KEY,
    ejercicio TEXT NOT NULL,
    series NUMERIC(2),
    repeticiones NUMERIC(2),
    peso_kg NUMERIC(6,2),
    fecha_entreno DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'pausado', 'completado', 'cancelado')),
    presupuesto NUMERIC(12),
    cliente TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    created_at TIMESTAMP DEFAULT NOW()
);