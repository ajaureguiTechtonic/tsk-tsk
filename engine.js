function Tasklist() {
  this.list = [];
};

// Scroll window function, scrolling to follow Tasklist
Tasklist.prototype.scrollWindow = function (idPOS) {
    var docHeight = $(document).height();
    var position = $("#"+idPOS).position().top;
    window.scrollTo({
      top: position,
      behavior: "smooth"
    });
  };

// initiate global taboos
var tempEditTaskIDunique;
var tempDeleteTaskIDunique;

$(".main-task-container").on('click', '.task', clickListener);


function clickListener(){
  //event listener for edit clicks
        // console.log("anyone home?");
        $(".listen-for-me-edit-task").on("click", function(event) {
          tempEditTaskIDunique = $(this).closest("div.task").attr("id");
          console.log("Heard click from taskID: " + tempEditTaskIDunique);
          // console.log($("#"+tActiveTaskID));
          // alert(tActiveTaskID);
        });

        $(".listen-for-me-delete-task").on("click", function(event) {
          var that = this;
          deleteTaskID = $(this).closest("div.task").attr("id");

          $("#whyNoWork").on("click", function () {
            taskContainer= $(that).closest(".container").remove();
            for (var i = 0; i < masterTasklist.list.length; i++) {
              if (deleteTaskID == masterTasklist.list[i].taskID){
                masterTasklist.list.splice(i, 1);
                masterTasklist.createStorage();
              }
            }
            $("#delete-task-modal").modal("hide");
          });
        });


}


// on tap event handler for mobile specific support.
$(document).ready(function() {
  $(".task").on("touchstart", function() {
    $(this).find(".collapse").collapse("toggle");
  });

  //listens for submit on edit task form then calls the edittask function
  $("#edit-task-form").on("submit", function(){
    var oTaskID = tempEditTaskIDunique;
    var oTaskName = $("#validation-edit").val();
    var oDueDate = $("input[id = 'form-group-edit-due']").val();
    var oDescription = $("input[id = 'form-group-edit-desc']").val();

    var taskChangesObj = {
      taskName: oTaskName,
      dueDate: oDueDate,
      description: oDescription,
      taskID: oTaskID,
    };
    var tTaskindex = showIndex(taskChangesObj); // finds the index of the matching task to change. adds index key value pair to taskchangesobj
    taskChangesObj.index = tTaskindex;
    // console.log("build temp task obj \n"+taskChangesObj);
    masterTasklist.list[tTaskindex].editTask(taskChangesObj);
  });
});

//add tasks
Tasklist.prototype.addTask = function (task) {
  var id = task.taskID;
  for (var i = 0; i < this.list.length; i++) {
    if (id == this.list[i].taskID){
      alert("Duplicate Task");
      masterTasklist.scrollWindow(id);
      return false;
    }
  }
  this.list.push(task);
  console.log(new Date(task.dateAdded).toDateString());
  masterTasklist.createStorage();
  this.showTask(task, this.sortTask(task))

  console.log("Task Added");
  return true;
};

Tasklist.prototype.calcDaysOld = function(dateAdded, currentDate) {
  var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
  var dateAdded = new Date(dateAdded).getTime();
  var currentDate = new Date().getTime();
  var daysOld = currentDate - dateAdded;

  return Math.round(daysOld / oneDay);
}

Tasklist.prototype.sortTask = function(task) {
  var daysOld = this.calcDaysOld(task.dateAdded, new Date().toDateString());
  var daysPastDue = this.calcDaysOld(task.dueDate, new Date().toDateString());
  var dueDate = new Date(task.dueDate);
  var dateAdded = new Date(task.dateAdded);

  if(dueDate > dateAdded && daysPastDue < 1) {
    console.log('This task has a future due date');
    var level = 1;
    return level;
  }

  if(task.dueDate === "Invalid Date" && daysOld <= 3) {
    var level = 1;
  } else if(task.dueDate) {
    var level = 1;
  }

  if(task.dueDate === "Invalid Date" && daysOld > 3) {
    var level = 2;
  } else if(task.dueDate && daysPastDue >= 1) {
    var level = 2;
  }

  if(task.dueDate === "Invalid Date" && daysOld > 6) {
    var level = 3;
  } else if(task.dueDate && daysPastDue >= 2) {
    var level = 3;
  }

  if(task.dueDate === "Invalid Date" && daysOld > 9) {
    var level = 4;
  } else if(task.dueDate && daysPastDue >= 3) {
    var level = 4;
  }

  if(task.dueDate === "Invalid Date" && daysOld > 13) {
    var level = 5;
  } else if(task.dueDate && daysPastDue >= 4) {
    var level = 5
  }
  return level
}

//Populate task list
Tasklist.prototype.showTask = function(task, level) {
  var currentDate = new Date().getTime();
  var daysOld = this.calcDaysOld(task.dateAdded, currentDate);
  if(level > 3) {
    this.makeHighLevelTask(task, level);
  } else {
    if(task.dueDate === "Invalid Date") {
      var month = daysOld;
      var day = 'Days Old';
    } else {
      var dueDate = (task.dueDate).split(' ');
      var month = dueDate[1];
      var day = dueDate[2];
    }

    $('.main-task-container').append(`
      <div id=${task.taskID} class="container task">
        <div class="row">
          <div class="col-12 col-md-10 offset-1 task-content level-${level}">
            <div class="row">
              <div class="col-2 col-md-1 justify-content-center complete-box my-auto ">
                <input type="checkbox">
                <span class="checkmark"></span>
              </div>
              <div class="col-7 col-md-9 d-flex">
                <p class="m-0 align-self-center">${task.taskName}</p>
              </div>
              <div class="col-3 col-md-2 d-flex justify-content-center">
                <div class="align-self-center text-center days-old-count">
                  <p class="m-0">${month}</p>
                  <p class="m-0 days-old">${day}</p>
                </div>
              </div>

              <div class="col-10 offset-1 col-sm-7 collapse task-description edit-this-task-${task.taskID}">
               <p>${task.description}</p>
             </div>
             <div class="col-12 col-sm-4 collapse edit-this-task-${task.taskID}">
               <div class="edit-content btn-group" role="group" aria-label="edit buttons">
                  <button type="button" class="btn edit-button listen-for-me-edit-task" data-toggle="modal" data-target="#edit-task-modal">Edit</button>
               </div>
             </div>
            </div>
          </div>
          <div class="col-1 edit-container edit-icon d-none d-sm-none d-md-block">
            <img src="assets/edit.png" data-toggle="collapse" data-target=".edit-this-task-${task.taskID}">
          </div>
        </div>
      </div>
    `)
  }
};

Tasklist.prototype.makeHighLevelTask = function(task, level) {
  var daysOld = this.calcDaysOld(task.dateAdded, new Date().toDateString());
  if(task.dueDate === "Invalid Date") {
    var month = daysOld;
    var day = 'Days Old';
  } else {
    var daysPastDue = this.calcDaysOld(task.dueDate, new Date().toDateString());
    var month = daysPastDue;
    var day = 'DAYS OVERDUE';
    console.log(task);
  }

  $('.main-task-container').append(`
    <div id=${task.taskID} class="container task">
      <div class="row">
        <div class="col-12 col-md-10 offset-1 task-content level-${level}">
          <div class="row">
            <div class="col-1 justify-content-center complete-box my-auto">
              <input type="checkbox">
              <span class="checkmark"></span>
            </div>
            <div class="col-10 my-auto">
              <p class="counter">${month} ${day}</p>
              <p class="task-name">${task.taskName}</p>
            </div>
            <div class="col-10 offset-1 col-sm-7 collapse task-description edit-this-task-${task.taskID}">
               <!-- TASK DESCRIPTION ID -->
               <p>${task.description}</p>
            </div>
            <div class="col-12 col-sm-4 collapse edit-this-task-${task.taskID}">
              <div class="edit-content btn-group" role="group" aria-label="edit buttons">
                    <button type="button" class="btn edit-button listen-for-me-edit-task" data-toggle="modal" data-target="#edit-task-modal">Edit</button>
                    <button type="button" class="btn edit-button listen-for-me-delete-task" data-toggle="modal" data-target="#delete-task-modal">Delete</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-1 edit-container edit-icon d-none d-sm-none d-md-block">
              <img src="assets/edit.png" data-toggle="collapse" data-target=".edit-this-task-${task.taskID}">
            </div>
          </div>
        </div>
  `)
}

// Add Task Modal Functionality
$("#add-task-modal").on("submit", function (e){
  var taskN = $("#newTaskName").val();

  if (taskN.replace(/\s+/g,"")){
    var newTaskN = taskN.trim();
    var taskD = $("#newTaskDescription").val();
    var dueD = $(".newDueDate").val();
    var addD = $(".modal-date").html();
    var tempRandomID = Math.floor( (Math.random()*20) + 6);
    masterTasklist.addTask(new Task(newTaskN, dueD, taskD, tempRandomID, addD));
    $("#add-task-modal").modal("hide");
    e.preventDefault();
    clearForm();
    masterTasklist.scrollWindow(tempRandomID);
  } else {
    alert("Please Enter a Valid Task Name");
    e.preventDefault();
  }
});

function clearForm() {
  $("#add-task-modal").find('input[type="text"]').val("");
}

// Date picker Functionality
$( function() {
  $( ".newDueDate" ).datepicker({ minDate: -20, maxDate: "+1M +10D" });
} );

// Modal Date Added
$(function () {
  var modalDateAdded = $(".modal-date");
  modalDateAdded.text(new Date().toDateString());
});

//delete tasks
Tasklist.prototype.deleteTask = function(task){
  var id = task.taskID;

  for(var index=0; index<this.list.length; index++) {
    if(this.list[index].taskID === id){
      this.list.splice(index,1);
      console.log("Task removed");
      masterTasklist.createStorage();
      return true;
    }
  }
  console.log("Task was not removed");
  return false;
};

//edit tasks

//local storage
Tasklist.prototype.createStorage = function() {
  console.log(this.list);
  localStorage.setItem('masterTasklist', JSON.stringify(this.list));
  return console.log("Tasklist Saved.");
};

Tasklist.prototype.getStorage = function() {
  if(localStorage.length) {
    var parsedTasks = JSON.parse(localStorage.getItem("masterTasklist"));
    for(var i = 0; i < parsedTasks.length; i++) {
      // console.log((new Date(parsedTasks[i].dateAdded).toDateString()).split(' ').slice(1).join(' '));
      // console.log(typeof(parsedTasks[i].dateAdded));
      // console.log(parsedTasks[i]);
      this.addTask(new Task (
        parsedTasks[i].taskName,
        parsedTasks[i].dueDate || "",
        parsedTasks[i].description,
        parsedTasks[i].taskID,
        new Date(parsedTasks[i].dateAdded)
      )
     )
    }
  }
};

document.addEventListener("DOMContentLoaded", function(e){
  window.masterTasklist = new Tasklist();
  masterTasklist.getStorage();
});
