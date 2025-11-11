import supabase from '../config/supabase.js';

// Get all media from Supabase
export const getMedia = async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ 
        error: 'Supabase not configured',
        message: 'Database service is not available'
      });
    }

    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ 
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ 
      error: 'Failed to fetch media',
      message: error.message 
    });
  }
};

// Upload media (metadata) to Supabase
export const uploadMedia = async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ 
        error: 'Supabase not configured',
        message: 'Database service is not available'
      });
    }

    const { title, description, url, type } = req.body;

    if (!title || !url || !type) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Title, URL, and type are required'
      });
    }

    const { data, error } = await supabase
      .from('media')
      .insert([
        { title, description, url, type }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({ 
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ 
      error: 'Failed to upload media',
      message: error.message 
    });
  }
};
