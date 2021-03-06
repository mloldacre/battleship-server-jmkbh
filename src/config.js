module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL
        || 'postgresql://dunder_mifflin@localhost/battleship',
    
    
    //DATABASE_URL: 'postgresql://postgres@localhost/postgres', 
    //!If I forgot to change this, just comment this one ^ out and uncomment the other one -The Dummy That Can't Handle DB's

    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '300h',
}