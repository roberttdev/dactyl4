class AddExtensionToAncestryFunction < ActiveRecord::Migration
  def up
    sql = "DROP FUNCTION IF EXISTS get_ancestry(INTEGER);
      CREATE FUNCTION get_ancestry(root_id INTEGER)
      RETURNS TABLE (id INTEGER, parent_id INTEGER, name VARCHAR, extension VARCHAR)
      AS $$
      WITH RECURSIVE ancestry(id, parent_id, name, extension) AS (
        SELECT id, parent_id, name, extension
        FROM groups
        WHERE id = $1
        UNION ALL
        SELECT C.id, C.parent_id, C.name, C.extension
        FROM ancestry P
        INNER JOIN groups C on P.parent_id = C.id
      )

      SELECT * from ancestry ORDER BY id ASC
      $$ LANGUAGE 'sql';"

    execute "DROP FUNCTION IF EXISTS get_ancestry(INTEGER);"
    execute sql
  end

  def down
    execute "DROP FUNCTION IF EXISTS get_ancestry(INTEGER);"
  end
end
