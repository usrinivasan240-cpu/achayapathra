const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'actorModel',
      required: true,
    },
    actorModel: {
      type: String,
      enum: ['User', 'Admin'],
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    context: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
