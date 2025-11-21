-- Enable pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to handle Search Completion -> Insert Notification
CREATE OR REPLACE FUNCTION handle_search_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'completed'
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES (
      NEW.user_id,
      'Search Completed',
      'Your search has finished. Found ' || COALESCE(NEW.results_count, 0) || ' results.',
      'search_completed',
      jsonb_build_object('search_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Search Completion
DROP TRIGGER IF EXISTS on_search_completed ON searches;
CREATE TRIGGER on_search_completed
AFTER UPDATE ON searches
FOR EACH ROW
EXECUTE FUNCTION handle_search_completion();

-- Function to call Edge Function for Notifications
CREATE OR REPLACE FUNCTION trigger_notify_users_generic()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  anon_key text;
BEGIN
  -- Hardcoded Anon Key for reliability (from project instructions)
  anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweG9jeW9tc2ZocW9mbHdpYnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTEyMzIsImV4cCI6MjA3NjYyNzIzMn0.Nw3vIQRmjltVULYEhe692UyBY4gIziJds5bqmf9_aw0';
  
  payload = jsonb_build_object(
    'record', row_to_json(NEW),
    'type', TG_OP,
    'table', TG_TABLE_NAME
  );

  PERFORM
    net.http_post(
      url := 'https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/notify-users',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := payload
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Notification Creation (sends Push)
DROP TRIGGER IF EXISTS on_notification_created ON notifications;
CREATE TRIGGER on_notification_created
AFTER INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION trigger_notify_users_generic();
