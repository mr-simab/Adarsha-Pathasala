const { requireSupabase } = require("../services/supabase");
const { classFromDb } = require("../services/formatters");

exports.listClasses = async (_req, res) => {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("school_classes")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) throw error;
  res.json(data.map(classFromDb));
};

exports.createClass = async (req, res) => {
  const { name, monthlyFee = 0 } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Class name is required." });
  }

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("school_classes")
    .insert({ name, monthly_fee: Number(monthlyFee || 0) })
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(classFromDb(data));
};

exports.removeClass = async (req, res) => {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("school_classes")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(classFromDb(data));
};
