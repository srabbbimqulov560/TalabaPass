import { createClient } from '@supabase/supabase-js';

// Bu ma'lumotlarni Supabase loyihangizning Project Settings -> API bo'limidan olasiz
const supabaseUrl = 'https://uoubpzawzettizoeirkr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdWJwemF3emV0dGl6b2VpcmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MzQ3MDAsImV4cCI6MjEwNDQxMDcwMH0.gutPzwodMv7oZTCmJ9f-zinOoyO5EyaRE-vJwB5Ibjk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);