-- Extend disc status enum to include 'lost'. Users mark a disc as lost
-- instead of deleting it, so they can look up model info later to replace it.
ALTER TABLE discs DROP CONSTRAINT discs_status_check;
ALTER TABLE discs ADD CONSTRAINT discs_status_check
  CHECK (status IN ('bag', 'shelf', 'lost'));
