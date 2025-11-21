-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('search_completed', 'community_alert', 'system', 'promotion')),
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Function to handle search completion notifications
CREATE OR REPLACE FUNCTION public.handle_search_completion_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger when status changes to 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO public.notifications (user_id, title, message, type, data)
        VALUES (
            NEW.user_id,
            'Search Completed',
            'Your search for "' || COALESCE(NEW.search_keywords, 'leads') || '" has finished. Check out the results!',
            'search_completed',
            jsonb_build_object('search_id', NEW.id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for search completion
DROP TRIGGER IF EXISTS on_search_completed ON public.searches;
CREATE TRIGGER on_search_completed
    AFTER UPDATE ON public.searches
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_search_completion_notification();
