const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const router = express.Router();
const authenticate = require('./middleware');
const connection  = require('./lib/db');

// Dashboard
router.get('/dashboard', authenticate.verify, function (req, res) {
    res.render('Dashboard/dashboard',{
        title: 'Dashboard',
        session: res.locals.session
  });
});

// get all users listing
router.get('/all-users/:id?', authenticate.verify, function (req, res) {
    console.log('request',req.params.id);
    var cur = typeof req.params.id != "undefined" ? req.params.id : 1;
    var limit = cur - 1;
    limit = limit * 10;
    console.log(limit);
    connection.query('SELECT count(*) as total FROM lc_users', function(error, rws, flds) {
        if(error) throw error
        console.log(mysql.format('SELECT * FROM lc_users ORDER BY uid DESC LIMIT ?,10',[limit]));
        connection.query(mysql.format('SELECT * FROM lc_users ORDER BY uid DESC LIMIT ?,10',[limit]), function(err, rows, fields) {
            if(err) throw err
            console.log(rws[0].total+ " " + Math.floor(rws[0].total/10));
            var totalpages = Math.floor(rws[0].total/10) == 0 ? 1 : Math.floor(rws[0].total/10);
            res.render('Users/users',{
                title: 'Users',
                session: res.locals.session,
                usersList: rows,
                pages: totalpages,
                current: cur
            });
        });
    });
    
});

// Add User
router.get('/add-user', authenticate.verify, function (req, res) {
    //console.log('add user errors',res.locals.success);
    res.render('Users/user',{
        title: 'Add User',
        session: res.locals.session,
        success: res.locals.success,
        error: res.locals.error
  });
});

router.post('/add-user', authenticate.verify, async function(req, res, next) {
    console.log('request params',req.body);
    const salt = await bcrypt.genSaltSync(10);
    const userpassword = await bcrypt.hash(req.body.password, salt);
    connection.query(mysql.format('INSERT INTO lc_users (fname, lname, username, password, email, phone, role, image) VALUES (?,?,?,?,?,?,?,?)', [req.body.fname,req.body.lname,req.body.username,userpassword,req.body.email,req.body.phone,req.body.role,req.body.profileimg]), function(err, rows, fields) {
        
        if(err) throw err
        
        var username = req.body.fname+" "+req.body.lname;
        req.flash('success', 'User '+username+' added successfully.');
        res.redirect('/add-user');
    });
});

router.post('/validate-user-form', function (req, res) {
    if(typeof req.body.action != "undefined" && req.body.action == 'user_form_validate' && typeof req.body.username !="undefined" && typeof req.body.phone !="undefined" && typeof req.body.email !="undefined"){
        connection.query(mysql.format('SELECT COUNT(*) AS total FROM lc_users WHERE username = ?', [req.body.username]), function(error, results, fields) {
            if (error) {
                //return reject(err);
                console.log('vaidation user error',error);
                res.json({
                    status: 'error',
                    msg: error.msg
                });
            } else {
                connection.query(mysql.format('SELECT COUNT(*) AS total FROM lc_users WHERE phone = ?', [req.body.phone]), function(err, rows, colums) {
                    if (err) {
                        console.log('vaidation user err',err);
                        res.json({
                            status: 'error',
                            msg: err.msg
                        });
                    } else {
                        connection.query(mysql.format('SELECT COUNT(*) AS total FROM lc_users WHERE email = ?', [req.body.email]), function(errs, allrows, allcolums) {
                            if (errs) {
                                console.log('vaidation user err',errs);
                                res.json({
                                    status: 'error',
                                    msg: errs.msg
                                });
                            } else {
                                res.json({
                                    user: results[0].total > 0 ? "Username already taken" : "success",
                                    phone: rows[0].total > 0 ? "Phone is already in use" : "success",
                                    email: allrows[0].total > 0 ? "Email Address already exists" : "success"
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.json({
            status: 'error',
            msg: 'Invalid parameters passed!'
        });
    }
});

router.post('/upload-avatar', async function(req, res){
    console.log('requested inage',req.files.file);
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let avatar = req.files.file;
            
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv('./uploads/users/' + avatar.name);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: avatar.name,
                    mimetype: avatar.mimetype,
                    size: avatar.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
    // fs.readFile(request.files.file.path, function(err, data) {

    //     var newPath = __dirname + "/public/img/xspectra/customlogo.png";
    //     fs.writeFile(newPath, data, function (err) {
    //       console.log("Finished writing file..." + err);
    //       response.redirect("back");
    //     });
    
    //   });
});

//delete user
router.post('/delete-user', function (req, res) {
    if(typeof req.body.action != "undefined" && req.body.action == 'delete_user' && typeof req.body.uid !="undefined" && req.body.uid > 0){
        connection.query(mysql.format('DELETE FROM lc_users WHERE uid=?', [req.body.uid]), function(err, rows) {
            if (err) {
                //return reject(err);
                console.log('delete error',err);
                res.json({
                    status: 'error',
                    msg: err.msg
                });
            } else {
                res.json({
                    status: rows.affectedRows > 0 ? 'success' : 'error',
                    msg: rows.affectedRows == 1? 'User deleted successfully!' : 'No record found for this user!'
                });
            }
        });
    } else {
        res.json({
            status: 'error',
            msg: 'Invalid parameters passed!'
        });
    }
});

//change status
router.post('/change-status', function (req, res) {
    if(typeof req.body.action != "undefined" && req.body.action == 'change_user_status' && typeof req.body.uid !="undefined" && req.body.uid > 0){
        connection.query(mysql.format('UPDATE lc_users SET status=? WHERE uid=?', [req.body.code,req.body.uid]), function(err, rows) {
            if (err) {
                //return reject(err);
                console.log('update error',err);
                res.json({
                    status: 'error',
                    msg: err.msg
                });
            } else {
                var status = req.body.code == 1 ? 'activated' : 'deactivated';
                res.json({
                    status: rows.affectedRows > 0 ? 'success' : 'error',
                    msg: rows.affectedRows == 1 ? 'User has been '+status+' successfully!' : 'No record found for this user!'
                });
            }
        });
    } else {
        res.json({
            status: 'error',
            msg: 'Invalid parameters passed!'
        });
    }
});

// Calendar
// router.get('/calendar', function (req, res) {
//     res.locals = {  title: 'Calendar' };
//     res.render('Calendar/calendar');
// })

// // Email
// router.get('/email-inbox', function (req, res) {
//     res.locals = {  title: 'Email Inbox' };
//     res.render('Email/email_inbox');
// })
// router.get('/email-compose', function (req, res) {
//     res.locals = {  title: 'Email Compose' };
//     res.render('Email/email_compose');
// })
// router.get('/email-read', function (req, res) {
//     res.locals = {  title: 'Email Read' };
//     res.render('Email/email_read');
// })

// // UI Elements
// router.get('/ui-alerts', function (req, res) {
//     res.locals = {  title: 'UI Alerts' };
//     res.render('UiElements/ui_alerts');
// })
// router.get('/ui-buttons', function (req, res) {
//     res.locals = {  title: 'UI Buttons' };
//     res.render('UiElements/ui_buttons');
// })
// router.get('/ui-badge', function (req, res) {
//     res.locals = {  title: 'UI Badge' };
//     res.render('UiElements/ui_badge');
// })
// router.get('/ui-cards', function (req, res) {
//     res.locals = {  title: 'UI Cards' };
//     res.render('UiElements/ui_cards');
// })
// router.get('/ui-carousel', function (req, res) {
//     res.locals = {  title: 'UI Carousel' };
//     res.render('UiElements/ui_carousel');
// })
// router.get('/ui-dropdowns', function (req, res) {
//     res.locals = {  title: 'UI Dropdowns' };
//     res.render('UiElements/ui_dropdowns');
// })
// router.get('/ui-grid', function (req, res) {
//     res.locals = {  title: 'UI Grid' };
//     res.render('UiElements/ui_grid');
// })
// router.get('/ui-images', function (req, res) {
//     res.locals = {  title: 'UI Images' };
//     res.render('UiElements/ui_images');
// })
// router.get('/ui-lightbox', function (req, res) {
//     res.locals = {  title: 'UI Lightbox' };
//     res.render('UiElements/ui_lightbox');
// })
// router.get('/ui-modals', function (req, res) {
//     res.locals = {  title: 'UI Modals' };
//     res.render('UiElements/ui_modals');
// })
// router.get('/ui-pagination', function (req, res) {
//     res.locals = {  title: 'UI Pagination' };
//     res.render('UiElements/ui_pagination');
// })
// router.get('/ui-popover-tooltips', function (req, res) {
//     res.locals = {  title: 'UI Popover tooltip' };
//     res.render('UiElements/ui_popover_tooltips');
// })
// router.get('/ui-rangeslider', function (req, res) {
//     res.locals = {  title: 'UI Range Slider' };
//     res.render('UiElements/ui_rangeslider');
// })
// router.get('/ui-session-timeout', function (req, res) {
//     res.locals = {  title: 'UI Session Timeout' };
//     res.render('UiElements/ui_session_timeout');
// })
// router.get('/ui-progressbars', function (req, res) {
//     res.locals = {  title: 'UI ProgressBars' };
//     res.render('UiElements/ui_progressbars');
// })
// router.get('/ui-sweet-alert', function (req, res) {
//     res.locals = {  title: 'UI Sweet Alert' };
//     res.render('UiElements/ui_sweet_alert');
// })
// router.get('/ui-tabs-accordions', function (req, res) {
//     res.locals = {  title: 'UI Tabs Accordions' };
//     res.render('UiElements/ui_tabs_accordions');
// })
// router.get('/ui-typography', function (req, res) {
//     res.locals = {  title: 'UI Typography' };
//     res.render('UiElements/ui_typography');
// })
// router.get('/ui-video', function (req, res) {
//     res.locals = {  title: 'UI Video' };
//     res.render('UiElements/ui_video');
// })

// // Form Elements
// router.get('/form-elements', function (req, res) {
//     res.locals = {  title: 'Form Elements' };
//     res.render('Forms/form_elements');
// })
// router.get('/form-validation', function (req, res) {
//     res.locals = {  title: 'Form Validation' };
//     res.render('Forms/form_validation');
// })
// router.get('/form-advanced', function (req, res) {
//     res.locals = {  title: 'Form Advanced' };
//     res.render('Forms/form_advanced');
// })
// router.get('/form-editors', function (req, res) {
//     res.locals = {  title: 'Form Editors' };
//     res.render('Forms/form_editors');
// })
// router.get('/form-uploads', function (req, res) {
//     res.locals = {  title: 'Form Uploads' };
//     res.render('Forms/form_uploads');
// })
// router.get('/form-xeditable', function (req, res) {
//     res.locals = {  title: 'Form Xeditable' };
//     res.render('Forms/form_xeditable');
// })

// // Charts
// router.get('/charts-morris', function (req, res) {
//     res.locals = {  title: 'Morris Chart' };
//     res.render('Charts/charts_morris');
// })
// router.get('/charts-chartist', function (req, res) {
//     res.locals = {  title: 'Chartist Chart' };
//     res.render('Charts/charts_chartist');
// })
// router.get('/charts-chartjs', function (req, res) {
//     res.locals = {  title: 'Charts Chartjs' };
//     res.render('Charts/charts_chartjs');
// })
// router.get('/charts-flot', function (req, res) {
//     res.locals = {  title: 'Charts Flot' };
//     res.render('Charts/charts_flot');
// })
// router.get('/charts-c3', function (req, res) {
//     res.locals = {  title: 'Charts C3' };
//     res.render('Charts/charts_c3');
// })
// router.get('/charts-other', function (req, res) {
//     res.locals = {  title: 'Charts Other' };
//     res.render('Charts/charts_other');
// })

// //tables
// router.get('/tables-basic', function (req, res) {
//     res.locals = {  title: 'Basic Tables' };
//     res.render('Tables/tables_basic');
// })
// router.get('/tables-datatable', function (req, res) {
//     res.locals = {  title: 'Datatable Tables' };
//     res.render('Tables/tables_datatable');
// })
// router.get('/tables-responsive', function (req, res) {
//     res.locals = {  title: 'Responsive Tables' };
//     res.render('Tables/tables_responsive');
// })
// router.get('/tables-editable', function (req, res) {
//     res.locals = {  title: 'Editable Tables' };
//     res.render('Tables/tables_editable');
// })

// //Icons  
// router.get('/icons-material', function (req, res) {
//     res.locals = {  title: 'Icons Material' };
//     res.render('Icons/icons_material');
// })
// router.get('/icons-ion', function (req, res) {
//     res.locals = {  title: 'Icons Ion' };
//     res.render('Icons/icons_ion');
// })
// router.get('/icons-fontawesome', function (req, res) {
//     res.locals = {  title: 'Icons Fontawesome' };
//     res.render('Icons/icons_fontawesome',{
//         title: 'Dashboard',
//         session: res.locals.session
//   });
// })
// router.get('/icons-themify', function (req, res) {
//     res.locals = {  title: 'Icons Themify' };
//     res.render('Icons/icons_themify');
// })
// router.get('/icons-dripicons', function (req, res) {
//     res.locals = {  title: 'Icons Dripicons' };
//     res.render('Icons/icons_dripicons');
// })
// router.get('/icons-typicons', function (req, res) {
//     res.locals = {  title: 'Icons Typicons' };
//     res.render('Icons/icons_typicons');
// })

// //Google Maps
// router.get('/maps-google', function (req, res) {
//     res.locals = {  title: 'Google Maps' };
//     res.render('Maps/maps_google');
// })
// router.get('/maps-vector', function (req, res) {
//     res.locals = {  title: 'Vector Maps' };
//     res.render('Maps/maps_vector');
// })

// //Extra pages
// router.get('/pages-timeline', function (req, res) {
//     res.locals = {  title: 'Pages Timeline' };
//     res.render('Extras/pages_timeline');
// })
// router.get('/pages-invoice', function (req, res) {
//     res.locals = {  title: 'pages-invoice' };
//     res.render('Extras/pages_invoice');
// })
// router.get('/pages-directory', function (req, res) {
//     res.locals = {  title: 'pages-directory' };
//     res.render('Extras/pages_directory');
// })
// router.get('/pages-blank', function (req, res) {
//     res.locals = {  title: 'pages-blank' };
//     res.render('Extras/pages_blank');
// })
router.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});
module.exports = router;