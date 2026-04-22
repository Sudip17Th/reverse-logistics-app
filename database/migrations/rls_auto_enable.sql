CREATE OR REPLACE FUNCTION public.rls_auto_enable ()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
    cmd RECORD;
BEGIN
    /* =========================
       Loop through DDL commands
    ========================== */
    FOR cmd IN
        SELECT *
        FROM pg_event_trigger_ddl_commands()
        WHERE command_tag IN (
            'CREATE TABLE',
            'CREATE TABLE AS',
            'SELECT INTO'
        )
        AND object_type IN ('table', 'partitioned table')
    LOOP

        /* =========================
           Only apply to public schema
           (ignore system schemas)
        ========================== */
        IF cmd.schema_name IS NOT NULL
           AND cmd.schema_name = 'public'
           AND cmd.schema_name NOT IN ('pg_catalog', 'information_schema')
           AND cmd.schema_name NOT LIKE 'pg_toast%'
           AND cmd.schema_name NOT LIKE 'pg_temp%' THEN

            BEGIN
                EXECUTE format(
                    'ALTER TABLE IF EXISTS %s ENABLE ROW LEVEL SECURITY',
                    cmd.object_identity
                );

                RAISE LOG 'rls_auto_enable: enabled RLS on %',
                    cmd.object_identity;

            EXCEPTION
                WHEN OTHERS THEN
                    RAISE LOG 'rls_auto_enable: failed to enable RLS on %',
                        cmd.object_identity;
            END;

        ELSE
            RAISE LOG 'rls_auto_enable: skip % (schema: %)',
                cmd.object_identity,
                cmd.schema_name;
        END IF;

    END LOOP;

END;
$$;