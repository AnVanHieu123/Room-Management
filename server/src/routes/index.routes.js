const userRoutes = require('./users.routes');
const categoryRoutes = require('./category.routes');
const roomRoutes = require('./room.routes');
const bookingRoutes = require('./booking.routes');
const favouriteRoutes = require('./favourite.routes');
const commentRoutes = require('./comment.routes');
const notificationRoutes = require('./notification.routes');
const feedbackRoutes = require('./feedback.routes');
const blogRoutes = require('./blog.routes');
const statisticsRoutes = require('./statistics.routes');

function routes(app) {
    app.use('/api/users', userRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/rooms', roomRoutes);
    app.use('/api/booking', bookingRoutes);
    app.use('/api/favourite', favouriteRoutes);
    app.use('/api/comment', commentRoutes);
    app.use('/api/notification', notificationRoutes);
    app.use('/api/feedback', feedbackRoutes);
    app.use('/api/blog', blogRoutes);
    app.use('/api/statistics', statisticsRoutes);
}

module.exports = routes;
