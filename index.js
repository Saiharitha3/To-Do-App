let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let currentSort = 'all';

        function selectOption(all) {
            document.getElementById('sort-btn').innerText = all;
        }

        function sortTasks(sortType) {
            currentSort = sortType;
            renderTasks();
            toggleSortMenu();
            
            // Update button text
            document.getElementById('sortButton').innerHTML = `<i class="fas fa-filter"></i> ${sortType.charAt(0).toUpperCase() + sortType.slice(1)}`;
        }
        
        // Theme toggle functionality
        function toggleTheme() {
            const html = document.documentElement;
            const themeToggleIcon = document.querySelector('.theme-toggle i');
            
            if (html.getAttribute('data-theme') === 'light') {
                html.setAttribute('data-theme', 'dark');
                themeToggleIcon.classList.remove('fa-moon');
                themeToggleIcon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                html.setAttribute('data-theme', 'light');
                themeToggleIcon.classList.remove('fa-sun');
                themeToggleIcon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            }
        }
        
        // Load saved theme from localStorage
        function loadSavedTheme() {
            const savedTheme = localStorage.getItem('theme');
            const themeToggleIcon = document.querySelector('.theme-toggle i');
            
            if (savedTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggleIcon.classList.remove('fa-moon');
                themeToggleIcon.classList.add('fa-sun');
            }
        }

        function formatDateForDisplay(dateStr) {
            if (!dateStr) return '';
            const [year, month, day] = dateStr.split('-'); // Directly extract values from the stored date string
            return `${month}-${day}-${year}`;
        }

        function toggleSortMenu() {
            document.getElementById('sortMenu').classList.toggle('show');
        }

        // Close sort menu when clicking outside
        window.onclick = function(event) {
            if (!event.target.matches('.sort-btn')) {
                const dropdowns = document.getElementsByClassName('sort-menu');
                for (const dropdown of dropdowns) {
                    if (dropdown.classList.contains('show')) {
                        dropdown.classList.remove('show');
                    }
                }
            }
        }

        function isValidDueDate(dateStr) {
            const selectedDate = new Date(dateStr);
            
            // Set hours, minutes, seconds and milliseconds to 0 for both dates to compare just the dates
            selectedDate.setHours(0, 0, 0, 0);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // The selected date should be greater than or equal to today
            return selectedDate >= today;
        }

        function validateForm() {
            const taskName = document.getElementById('taskName').value.trim();
            const date = document.getElementById('taskDate').value;
            let isValid = true;

            // Reset error messages
            document.getElementById('nameError').style.display = 'none';
            document.getElementById('dateError').style.display = 'none';

            if (!taskName) {
                document.getElementById('nameError').style.display = 'block';
                isValid = false;
            }

            if (!date) {
                document.getElementById('dateError').textContent = 'Due date is required';
                document.getElementById('dateError').style.display = 'block';
                isValid = false;
            } else if (!isValidDueDate(date)) {
                document.getElementById('dateError').textContent = 'Due date must be a future date';
                document.getElementById('dateError').style.display = 'block';
                isValid = false;
            }

            return isValid;
        }

        function addTask() {
            if (!validateForm()) return;

            const taskName = document.getElementById('taskName').value.trim();
            const description = document.getElementById('taskDescription').value.trim();
            const priority = document.getElementById('priority').value;
            const date = document.getElementById('taskDate').value;

            const task = {
                id: Date.now(),
                name: taskName,
                description: description,
                priority: priority,
                dueDate: date,  // Store as a string without conversion
                completed: false,
                createdAt: new Date().toLocaleString()
            };

            tasks.unshift(task);
            saveTasks();
            clearForm();
            renderTasks();
        }

        function clearForm() {
            document.getElementById('taskName').value = '';
            document.getElementById('taskDescription').value = '';
            document.getElementById('priority').value = '';
            document.getElementById('taskDate').value = '';
            document.getElementById('nameError').style.display = 'none';
            document.getElementById('dateError').style.display = 'none';
        }

        function toggleTaskStatus(id) {
            tasks = tasks.map(task => 
                task.id === id ? {...task, completed: !task.completed} : task
            );
            saveTasks();
            renderTasks();
        }
        

        function deleteTask(id) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }

        function editTask(id) {
            const task = tasks.find(t => t.id === id);
            document.getElementById('taskName').value = task.name;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('priority').value = task.priority;
            document.getElementById('taskDate').value = task.dueDate;
            
            deleteTask(id);
        }

        function sortTasks(sortType) {
            currentSort = sortType;
            renderTasks();
            toggleSortMenu();
        }

        function filterTasks() {
            renderTasks();
        }

        function clearAllTasks() {
            if (confirm('Are you sure you want to clear all tasks?')) {
                tasks = [];
                saveTasks();
                renderTasks();
            }
        }

        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        function renderTasks() {
            const searchText = document.getElementById('searchInput').value.toLowerCase();
            let filteredTasks = tasks;

            // Apply search filter
            if (searchText) {
                filteredTasks = filteredTasks.filter(task => 
                    task.name.toLowerCase().includes(searchText) || 
                    task.description.toLowerCase().includes(searchText)
                );
            }

            // Apply sort filter
            if (currentSort !== 'all') {
                filteredTasks = filteredTasks.filter(task => 
                    currentSort === 'completed' ? task.completed : !task.completed
                );
            }

            const taskList = document.getElementById('taskList');
            
            if (filteredTasks.length === 0) {
                taskList.innerHTML = `
                    <div style="text-align: center; color: var(--task-details); padding: 20px;">
                        No tasks found
                    </div>
                `;
                return;
            }

            taskList.innerHTML = filteredTasks.map(task => `
                <div class="task-card">
                    <div class="task-header">
                        <input type="checkbox" 
                               class="task-checkbox" 
                               ${task.completed ? 'checked' : ''} 
                               onclick="toggleTaskStatus(${task.id})">
                        <span class="task-title">${task.name}</span>
                        <div class="task-actions">
                            <button class="complete-btn" onclick="toggleTaskStatus(${task.id})">
                                <i class="fas fa-complete"></i>
                            </button>
                            <button onclick="editTask(${task.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteTask(${task.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>

                    </div>
                    <div class="task-details">
                        <div>${task.description}</div>
                        <div class="task-meta">
                            Created: ${task.createdAt}
                            ${task.dueDate ? `<br>Due Date: ${formatDateForDisplay(task.dueDate)}` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Typing effect for heading
        function typeEffect(text, element, speed) {
            let i = 0;
            element.textContent = '';
            
            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                }
            }
            
            type();
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Set min date for task date input
            const taskDateInput = document.getElementById('taskDate');
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            taskDateInput.min = `${year}-${month}-${day}`;
            
            // Load saved theme
            loadSavedTheme();
            
            // Render tasks
            renderTasks();

            // Start typing effect after preloader
            setTimeout(() => {
                const typingText = document.getElementById('typingText');
                typeEffect('Your Smart To-Do List', typingText, 100);
            }, 2100);
        });

        window.addEventListener("load", function() {
            setTimeout(() => {
                document.querySelector(".preloader").style.display = "none";
                document.querySelector(".content").style.display = "block";
            }, 2000); // Adjust time if needed
        });