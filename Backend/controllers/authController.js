// ... (register function remains the same)

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role, // Add role to the payload
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role }); // Return role along with token
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};