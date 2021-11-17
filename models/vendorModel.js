const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A vendor must have a name'],
		},
		contact_name: {
			type: String,
			required: [true, 'A vendor must have a contact name'],
		},
		address: {
			type: String,
			required: [true, 'A vendor must have an address'],
		},
		is_available: { type: Boolean, default: true },
		city: String,
		state: String,
		postal_code: String,
		country: String,
		phone: String,
		email: String,
		url: String,
		type_of_products: String,
		discount_available: Boolean,
		discount: String,
		logo: String,
		photo: String,
		description: String,
		seo_title: String,
		seo_description: String,
		slug: String,
		onboarded_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
	},
	{ timestamps: true }
);

const Vendor = mongoose.model('vendor', vendorSchema);

module.exports = Vendor;
