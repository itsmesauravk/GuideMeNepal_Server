import District from "../../../models/district.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import slug from "slug";
import { Op, Sequelize } from "sequelize";





  const addSingleDistrict = asyncHandler(async (req, res) => {
    const { name, tags, description, image,coordinates } = req.body;

    if (!name || !tags || !description || !image || !coordinates) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing required fields');
              }
              
              // Generate slug from name
              const districtSlug = slug(name);
              
              // Check if district with this slug already exists
              const existingDistrict = await District.findOne({ 
                where: { slug: districtSlug } 
              });
              
              if (existingDistrict) {
                throw new ApiError(StatusCodes.CONFLICT, 'District with this name already exists');
              }
              
              // Create new district
              const district = await District.create({
                name,
                slug: districtSlug,
                tags,
                description,
                image,
                coordinates
              });
              res.status(StatusCodes.CREATED).json(
                new ApiResponse(StatusCodes.CREATED, 'District added successfully', district)
            );    
              

  });



  const addBulkDistrict = asyncHandler(async (req, res) => {
    
    if (!req.body || !Array.isArray(req.body)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid data format. Expected an array of district objects');
    }
    
    const districts = req.body;
    const results = {
        total: districts.length,    
        created: 0,
        failed: 0,
        errors: []
    };
    
    // Process each district
    for (const districtData of districts) {
        try {
            // Validate required fields
            if (!districtData.name || !districtData.tags || !districtData.description || !districtData.image || !districtData.coordinates) {
                results.failed++;
                results.errors.push({
                    name: districtData.name || 'Unknown',
                    error: 'Missing required fields'
                });
                continue;
            }
            
            // Generate slug
            districtData.slug = slug(districtData.name);
            
            // Create district
            await District.create(districtData);
            results.created++;
        } catch (error) {
            results.failed++;
            results.errors.push({
                name: districtData.name || 'Unknown',
                error: error.message
            });
        }
    }
    
    res.status(StatusCodes.CREATED).json(
        new ApiResponse(StatusCodes.CREATED, 'Districts added successfully', results)
    );
});


//get all districts 
const getAllDistricts = asyncHandler(async (req, res) => {
    const {
        select,
        page = 1,
        limit = 10,
        sort = "name",
        search
    } = req.query;
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    // Build query options
    let queryOptions = {
        limit: limitNum,
        offset: offset
    };
    
    // Handle attributes (select)
    if (select) {
        queryOptions.attributes = select.split(',').map(field => field.trim());
    }
    
    // Handle sorting
    if (sort) {
        const order = [];
        if (sort.startsWith('-')) {
            order.push([sort.substring(1), 'DESC']);
        } else {
            order.push([sort, 'ASC']);
        }
        queryOptions.order = order;
    }
    
    // Handle search (where conditions)
    if (search) {
        queryOptions.where = {
            [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
                // For tags (assuming it's an array or has a text search capability)
                // This will depend on how tags are stored in PostgreSQL
                // Sequelize.literal(`"tags" @> ARRAY['${search}']`) // if using array
            ]
        };
    }
    
    // Execute query
    const { count, rows: districts } = await District.findAndCountAll(queryOptions);
    
    // Prepare pagination metadata
    const pagination = {
        total: count,
        pages: Math.ceil(count / limitNum),
        page: pageNum,
        limit: limitNum
    };
    
    res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            'Showing All Districts',
            { districts, pagination }
        )
    );
});


const getSingleDistrict = asyncHandler(async (req, res) => {
    const { slug } = req.params;

   

    if(!slug) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'District slug is required');
    }

    const district = await District.findOne({
        where: { slug },
        attributes: ['id', 'name', 'slug', 'tags' ,'description', 'image']
    });

    district.increment('views');
    await district.save();
    
    
    if (!district) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'District not found');
    }
    
    res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, 'District found', district)
    );
});


//get popular districts
const getPopularDistricts = asyncHandler(async (req, res) => {
    try {
        const districts = await District.findAll({
            attributes: [
                'id', 
                'name', 
                'slug', 
                'description', 
                'image', 
                'views',
                'guideRegistered',
                'bookings',
                [
                    Sequelize.literal(
                        `(views * 0.3 + "guideRegistered" * 0.35 + bookings * 0.35)`
                    ), 
                    'popularityScore'
                ]
            ],
            where: {
                [Op.or]: [
                    { views: { [Op.gt]: 0 } },
                    { guideRegistered: { [Op.gt]: 0 } },
                    { bookings: { [Op.gt]: 0 } }
                ],
                isActive: true // Only fetch active districts
            },
            order: [
                [Sequelize.literal('"popularityScore"'), 'DESC']
            ],
            limit: 7
        });

        return res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, "Popular districts found", districts)
        );
    } catch (error) {
        console.error('Error fetching popular districts:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            new ApiResponse(
                StatusCodes.INTERNAL_SERVER_ERROR, 
                "Error fetching popular districts", 
                null
            )
        );
    }
});


  


export { addSingleDistrict, addBulkDistrict, getAllDistricts, getSingleDistrict, getPopularDistricts };