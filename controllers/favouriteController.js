const Favourite = require('../models/Favourite');
const Product = require('../models/product');

// Get favourites document by user ID
exports.getFavouritesByUserId = async (req, res) => {
    try {
        const userId = req.user.id;
        let favourite = await Favourite.findOne({ userId });

        if (!favourite) {
            favourite = new Favourite({ userId, lists: [] });
            await favourite.save();
        }

        res.json(favourite);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new list
exports.addList = async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;

    try {
        let favourite = await Favourite.findOne({ userId });

        if (!favourite) {
            favourite = new Favourite({ userId, lists: [] });
        }

        favourite.lists.push({ name, items: [] });
        await favourite.save();
        res.status(201).json(favourite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add a product to a specific list by listId
exports.addProductToList = async (req, res) => {
    const userId = req.user.id;
    const { listId, productId } = req.body;

    try {
        const favourite = await Favourite.findOne({ userId });
        if (!favourite) return res.status(404).json({ message: 'Favourite not found' });

        const list = favourite.lists.find(l => l._id.toString() === listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const product = await Product.findById(productId).lean(); // lean عشان يرجع Object عادي
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (list.items.some(item => item._id.toString() === product._id.toString())) {
            return res.status(400).json({ message: 'Product already in list' });
        }

        list.items.push(product);

       
        await favourite.save();

       
        res.json(favourite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
  };

// Remove product from a list using listId
exports.removeProductFromList = async (req, res) => {
    const userId = req.user.id;
    const { listId, productId } = req.body;

    try {
        const favourite = await Favourite.findOne({ userId });
        if (!favourite) return res.status(404).json({ message: 'Favourite not found' });

        const list = favourite.lists.find(l => l._id.toString() === listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        list.items = list.items.filter(item => item.id !== productId);
        await favourite.save();
        res.json(favourite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Rename a list by listId
exports.renameList = async (req, res) => {
    const userId = req.user.id;
    const { listId, newName } = req.body;  

    try {
        const favourite = await Favourite.findOne({ userId });
        if (!favourite) return res.status(404).json({ message: 'User not found' });

        // Find the list by its ID
        const list = favourite.lists.find(l => l._id.toString() === listId);  // Use listId here
        if (!list) return res.status(404).json({ message: 'List not found' });

        // Update the list's name
        list.name = newName;
        await favourite.save();
        res.json(favourite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a list by listId
exports.deleteList = async (req, res) => {
    const userId = req.user.id;
    const { listId } = req.params

    try {
        const favourite = await Favourite.findOne({ userId });
        if (!favourite) return res.status(404).json({ message: 'User not found' });

        // Check if list exists before filtering
        const listExists = favourite.lists.some(l => l._id.toString() === listId);
        if (!listExists) return res.status(404).json({ message: 'List not found' });

        // Remove the list
        favourite.lists = favourite.lists.filter(l => l._id.toString() !== listId);

        await favourite.save();
        res.json(favourite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a single list by listId for the authenticated user
exports.getListById = async (req, res) => {
    const userId = req.user.id;
    const { listId } = req.params; // assuming listId is passed as a URL param

    try {
        const favourite = await Favourite.findOne({ userId });
        if (!favourite) return res.status(404).json({ message: 'Favourite not found' });

        const list = favourite.lists.find(l => l._id.toString() === listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        res.json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  };