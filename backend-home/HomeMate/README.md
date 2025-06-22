# HomeMate

HomeMate is a roommate-matching application designed to help users find compatible roommates based on their preferences and lifestyle choices. This application utilizes a MongoDB database for storing user information and provides a RESTful API for user registration.

## Features

- User registration with detailed profile information.
- Password hashing for secure storage.
- MongoDB integration for data persistence.
- API documentation using Swagger.

## Project Structure

```
HomeMate
├── Controllers
│   └── AuthController.cs
├── Data
│   └── MongoDbContext.cs
├── Dtos
│   └── RegisterUserDto.cs
├── Models
│   └── User.cs
├── Services
│   └── UserService.cs
├── appsettings.json
├── Program.cs
├── HomeMate.csproj
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd HomeMate
   ```

2. **Install dependencies:**
   Ensure you have the .NET SDK installed. Run the following command to restore the project dependencies:
   ```
   dotnet restore
   ```

3. **Configure MongoDB:**
   Update the `appsettings.json` file with your MongoDB connection string and database name.

4. **Run the application:**
   Start the application using:
   ```
   dotnet run
   ```

5. **Access the API:**
   The API will be available at `http://localhost:5000`. You can view the Swagger documentation at `http://localhost:5000/swagger`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.