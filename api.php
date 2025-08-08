<?php

// Allow requests from any origin (for development purposes). In production, restrict this.
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600"); // Cache preflight requests for 1 hour
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
include_once 'config.php';
include_once 'Database.php';
include_once 'User.php';
include_once 'Product.php'; // Include other model classes as you create them (e.g., Inventory, Sale)

// Get database connection
$database = Database::getInstance();
$db = $database->getConnection();

// Instantiate objects (models)
$user = new User($db);
$product = new Product($db); // Example for product management

// Get the HTTP method and action parameter from the URL query string
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Function to send JSON response and terminate script
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit; // Terminate script after sending response
}

// Handle preflight OPTIONS request for CORS
if ($method == 'OPTIONS') {
    sendJsonResponse(['message' => 'Preflight OK']);
}

// Handle API requests based on HTTP method and action
switch ($method) {
    case 'POST':
        // Decode JSON body for POST requests
        $data = json_decode(file_get_contents("php://input"), true); 

        if (empty($action)) {
            sendJsonResponse(['success' => false, 'message' => 'Action not specified.'], 400);
        }

        switch ($action) {
            case 'createUser':
                // Validate required fields for user creation
                if (
                    !empty($data['user_id']) &&
                    !empty($data['user_pass']) &&
                    !empty($data['user_department']) &&
                    !empty($data['user_type']) &&
                    isset($data['user_status']) // Status can be 0 or 1, so check with isset
                ) {
                    $result = $user->createUser(
                        $data['user_id'],
                        $data['user_pass'],
                        $data['user_department'],
                        $data['user_type'],
                        $data['user_status']
                    );
                    sendJsonResponse($result, $result['success'] ? 201 : 400); // 201 for Created
                } else {
                    sendJsonResponse(['success' => false, 'message' => 'Missing required fields for user creation.'], 400);
                }
                break;

            case 'loginUser':
                // Validate required fields for user login
                if (
                    !empty($data['user_id']) &&
                    !empty($data['user_pass'])
                ) {
                    $result = $user->loginUser(
                        $data['user_id'],
                        $data['user_pass']
                    );
                    sendJsonResponse($result, $result['success'] ? 200 : 401); // 401 for Unauthorized
                } else {
                    sendJsonResponse(['success' => false, 'message' => 'Missing user ID or password for login.'], 400);
                }
                break;

            case 'createProduct': // Example action for creating a product
                // Basic validation for product creation fields
                if (
                    !empty($data['ProductName']) &&
                    !empty($data['GenericName']) &&
                    !empty($data['Strength']) &&
                    !empty($data['PharmaceuticalForm']) &&
                    !empty($data['RouteOfAdministration']) &&
                    !empty($data['ManufacturerID']) &&
                    !empty($data['ATC_Code']) &&
                    isset($data['Description']) && // Description can be empty, so check with isset
                    isset($data['PrescriptionRequired']) &&
                    !empty($data['DrugIdentificationNumber'])
                ) {
                    $result = $product->createProduct($data);
                    sendJsonResponse($result, $result['success'] ? 201 : 400);
                } else {
                    sendJsonResponse(['success' => false, 'message' => 'Missing required fields for product creation.'], 400);
                }
                break;

            // Add other POST actions here (e.g., 'createInventory', 'placeOrder', 'recordSale')
            default:
                sendJsonResponse(['success' => false, 'message' => 'Invalid POST action.'], 400);
                break;
        }
        break;

    case 'GET':
        switch ($action) {
            case 'getProducts': // Example action for fetching all products
                $result = $product->getProducts();
                sendJsonResponse($result, $result['success'] ? 200 : 404);
                break;

            case 'getProductById': // Example action for fetching a single product by ID
                if (isset($_GET['id']) && is_numeric($_GET['id'])) {
                    $product_id = (int)$_GET['id']; // Cast to integer for safety
                    $result = $product->getProductById($product_id);
                    sendJsonResponse($result, $result['success'] ? 200 : 404);
                } else {
                    sendJsonResponse(['success' => false, 'message' => 'Product ID is missing or invalid.'], 400);
                }
                break;

            // Add other GET actions here (e.g., 'getInventories', 'getSales', 'getSuppliers')
            default:
                sendJsonResponse(['success' => false, 'message' => 'Invalid GET action.'], 400);
                break;
        }
        break;

    case 'PUT': // For updates
        $data = json_decode(file_get_contents("php://input"), true); // Get JSON PUT body
        if (empty($action)) {
            sendJsonResponse(['success' => false, 'message' => 'Action not specified.'], 400);
        }

        switch ($action) {
            case 'updateProduct': // Example action for updating a product
                if (isset($_GET['id']) && is_numeric($_GET['id']) && !empty($data)) {
                    $product_id = (int)$_GET['id'];
                    $result = $product->updateProduct($product_id, $data);
                    sendJsonResponse($result, $result['success'] ? 200 : 400);
                } else {
                    sendJsonResponse(['success' => false, 'message' => 'Product ID or data missing for update.'], 400);
                }
                break;
            // Add other PUT actions here (e.g., 'updateInventory', 'updateOrder')
            default:
                sendJsonResponse(['success' => false, 'message' => 'Invalid PUT action.'], 400);
                break;
        }
        break;

    case 'DELETE': // For deletions
        if (empty($action)) {
            sendJsonResponse(['success' => false, 'message' => 'Action not specified.'], 400);
        }

        switch ($action) {
            case 'deleteProduct': // Example action for deleting a product
                if (isset($_GET['id']) && is_numeric($_GET['id'])) {
                    $product_id = (int)$_GET['id'];
                    $result = $product->deleteProduct($product_id);
                    sendJsonResponse($result, $result['success'] ? 200 : 400);
                } else {
                    sendJsonResponse(['success' => false, 'message' => 'Product ID missing for delete.'], 400);
                }
                break;
            // Add other DELETE actions here (e.g., 'deleteInventory', 'cancelOrder')
            default:
                sendJsonResponse(['success' => false, 'message' => 'Invalid DELETE action.'], 400);
                break;
        }
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405); // 405 for Method Not Allowed
        break;
}

?>