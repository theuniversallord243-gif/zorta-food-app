# Deployment Checklist - Zorta Food App

## Pre-Deployment

### Environment Setup
- [ ] Install dependencies: `npm install bcryptjs joi`
- [ ] Create `.env.local` with all required variables
- [ ] Verify all environment variables are set
- [ ] Test email configuration for OTP

### Security Verification
- [ ] Confirm passwords are hashed (bcryptjs)
- [ ] Verify OTP is server-side stored
- [ ] Check input validation is working
- [ ] Ensure error messages don't leak sensitive info
- [ ] Verify credentials are not in code

### Data Files
- [ ] Ensure `data/ratings.json` exists
- [ ] Ensure `data/otp-store.json` exists
- [ ] Backup existing data files
- [ ] Verify file permissions

---

## Testing

### Authentication Tests
- [ ] User signup with password hashing
- [ ] User login with credentials
- [ ] Google OAuth login
- [ ] Password reset flow (OTP)
- [ ] OTP expiration (10 minutes)
- [ ] Invalid credentials rejection

### Order Tests
- [ ] Create order
- [ ] Update order status
- [ ] Fetch order by ID
- [ ] Fetch user's orders
- [ ] Fetch outlet's orders
- [ ] Status history tracking

### Rating Tests
- [ ] Submit rating (1-5 stars)
- [ ] Add comment to rating
- [ ] Prevent duplicate ratings
- [ ] Verify user ownership
- [ ] Calculate average rating
- [ ] Fetch outlet ratings

### Validation Tests
- [ ] Invalid email format
- [ ] Short password (< 6 chars)
- [ ] Invalid phone number
- [ ] Missing required fields
- [ ] Invalid rating (0 or > 5)
- [ ] Long comments (> 500 chars)

### Error Handling Tests
- [ ] Non-existent user
- [ ] Non-existent order
- [ ] Non-existent outlet
- [ ] Database errors
- [ ] Email sending failures
- [ ] Invalid OTP

---

## Performance

### Optimization
- [ ] Check API response times
- [ ] Verify database queries are efficient
- [ ] Test with multiple concurrent users
- [ ] Monitor memory usage
- [ ] Check file I/O performance

### Monitoring
- [ ] Set up error logging
- [ ] Monitor API endpoints
- [ ] Track user signups
- [ ] Monitor order creation
- [ ] Track rating submissions

---

## Security Audit

### Code Review
- [ ] No hardcoded credentials
- [ ] No sensitive data in logs
- [ ] Input validation on all endpoints
- [ ] Error handling on all routes
- [ ] Password hashing verified
- [ ] OTP server-side storage verified

### Dependency Check
- [ ] bcryptjs is secure version
- [ ] joi is up to date
- [ ] next-auth is secure version
- [ ] No vulnerable dependencies

### API Security
- [ ] HTTPS enabled (production)
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input sanitization working
- [ ] Output encoding correct

---

## Documentation

### Code Documentation
- [ ] API endpoints documented
- [ ] Function comments added
- [ ] Error codes documented
- [ ] Environment variables documented

### User Documentation
- [ ] Setup instructions clear
- [ ] API examples provided
- [ ] Troubleshooting guide
- [ ] FAQ section

---

## Deployment Steps

### 1. Pre-Deployment
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build project
npm run build
```

### 2. Environment Setup
```bash
# Create .env.local with:
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://yourdomain.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
OTP_EXPIRY_MINUTES=10
```

### 3. Database Backup
```bash
# Backup existing data
cp -r data/ data_backup_$(date +%Y%m%d)
```

### 4. Deploy
```bash
# Start production server
npm run start
```

### 5. Post-Deployment
```bash
# Verify all endpoints
curl https://yourdomain.com/api/users
curl https://yourdomain.com/api/orders
curl https://yourdomain.com/api/rating
```

---

## Rollback Plan

### If Issues Occur
1. Stop the application
2. Restore from backup: `cp -r data_backup_* data/`
3. Revert code changes if needed
4. Restart application
5. Investigate and fix issues

### Backup Strategy
- Daily backups of data files
- Version control for code
- Environment variable backups (secure)
- Database snapshots (if using DB)

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Application is running
- [ ] No error spikes
- [ ] API response times normal
- [ ] Database size reasonable

### Weekly Checks
- [ ] Review error logs
- [ ] Check user feedback
- [ ] Monitor performance metrics
- [ ] Verify backups working

### Monthly Checks
- [ ] Security audit
- [ ] Dependency updates
- [ ] Performance optimization
- [ ] Capacity planning

---

## Troubleshooting

### Common Issues

**Issue:** OTP not sending
- Check EMAIL_USER and EMAIL_PASSWORD
- Verify Gmail app password
- Check email service status

**Issue:** Password reset failing
- Verify OTP is being stored
- Check OTP expiration time
- Verify password hashing

**Issue:** Order status not updating
- Check API endpoint
- Verify order exists
- Check status validation

**Issue:** Rating not submitting
- Verify user ownership
- Check for duplicate ratings
- Verify outlet exists

---

## Success Criteria

- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] API response time < 200ms
- [ ] Error rate < 0.1%
- [ ] User satisfaction > 4.5/5
- [ ] Zero data loss
- [ ] 99.9% uptime

---

## Sign-Off

- [ ] Development Lead: ___________
- [ ] QA Lead: ___________
- [ ] Security Lead: ___________
- [ ] DevOps Lead: ___________
- [ ] Product Manager: ___________

---

## Post-Deployment Notes

```
Date: ___________
Deployed By: ___________
Version: ___________
Issues: ___________
Notes: ___________
```

---

## Contact & Support

- **Issues:** Create GitHub issue
- **Questions:** Contact dev team
- **Emergencies:** Page on-call engineer
- **Documentation:** See SECURITY_IMPROVEMENTS.md

---

**Last Updated:** 2024
**Status:** Ready for Deployment
