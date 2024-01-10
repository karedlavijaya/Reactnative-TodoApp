import React, {useState, useEffect} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import {Button} from 'react-native-paper';
import Fallback from './components/Fallback';
import DateTimePicker from '@react-native-community/datetimepicker';
import ModalSelector from 'react-native-modal-selector';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoScreen = () => {
  const [todo, setTodo] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState('Low');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('New');
  const [description, setDescription] = useState('');

  const [todoList, setTodoList] = useState([]);
  const [editedTodo, setEditedTodo] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const saveTasks = async tasks => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to local storage:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTodoList(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks from local storage:', error);
    }
  };

  const handleAddTodo = () => {
    if (!todo.trim()) {
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: todo.trim(),
      dueDate: dueDate.toISOString(),
      priority,
      category,
      status,
      description,
    };

    setTodoList([...todoList, newTask]);
    saveTasks([...todoList, newTask]);
    resetForm();
  };

  const handleDeleteTodo = id => {
    const updatedTodoList = todoList.filter(task => task.id !== id);
    setTodoList(updatedTodoList);
    saveTasks(updatedTodoList);
  };

  const handleEditTodo = task => {
    setEditedTodo(task);
    setTodo(task.title);
    setDueDate(new Date(task.dueDate));
    setPriority(task.priority);
    setCategory(task.category);
    setStatus(task.status);
    setDescription(task.description);
    setModalVisible(true);
  };

  const handleViewTodo = task => {
    setSelectedTask(task);
    setViewModalVisible(true);
  };

  const handleUpdateTodo = () => {
    const updatedTodos = todoList.map(task => {
      if (task.id === editedTodo.id) {
        return {
          ...task,
          title: todo.trim(),
          dueDate: dueDate.toISOString(),
          priority,
          category,
          status,
          description,
        };
      }
      return task;
    });

    setTodoList(updatedTodos);
    saveTasks(updatedTodos);
    resetForm();
    setModalVisible(false);
  };

  const resetForm = () => {
    setTodo('');
    setDueDate(new Date());
    setPriority('Low');
    setCategory('');
    setStatus('New');
    setDescription('');
    setEditedTodo(null);
  };

  const renderTodos = ({item}) => {
    return (
      <View style={styles.taskContainer}>
        <TouchableOpacity
          style={styles.taskContent}
          onPress={() => handleEditTodo(item)}>
          <Text style={styles.taskTitle}>{item.title}</Text>
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <Button
            icon="eye"
            mode="contained"
            onPress={() => handleViewTodo(item)}
            style={styles.viewButton}>
            View
          </Button>
          <Button
            icon="delete"
            mode="contained"
            onPress={() => handleDeleteTodo(item.id)}
            style={styles.deleteButton}>
            Delete
          </Button>
        </View>
      </View>
    );
  };

  const renderPriorityOptions = () => {
    return [
      {key: 'Low', label: 'Low'},
      {key: 'Medium', label: 'Medium'},
      {key: 'High', label: 'High'},
    ];
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Add a task"
        value={todo}
        onChangeText={userText => setTodo(userText)}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
      {todoList.length <= 0 && <Fallback />}
      <FlatList data={todoList} renderItem={renderTodos} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={todo}
              onChangeText={userText => setTodo(userText)}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => setDatePickerVisibility(true)}>
              <Text style={styles.buttonText}>Select Due Date</Text>
            </TouchableOpacity>
            {isDatePickerVisible && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => {
                  setDatePickerVisibility(false);
                  if (selectedDate) {
                    setDueDate(selectedDate);
                  }
                }}
              />
            )}
            <ModalSelector
              data={renderPriorityOptions()}
              initValue="Select Priority"
              accessible={true}
              scrollViewAccessibilityLabel={'Scrollable options'}
              cancelButtonAccessibilityLabel={'Cancel Button'}
              onChange={option => setPriority(option.key)}>
              <TextInput
                style={styles.input}
                placeholder="Priority"
                value={priority}
                editable={false}
              />
            </ModalSelector>
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={category}
              onChangeText={categoryText => setCategory(categoryText)}
            />
            <ModalSelector
              data={[
                {key: 'New', label: 'New'},
                {key: 'In Progress', label: 'In Progress'},
                {key: 'Completed', label: 'Completed'},
              ]}
              initValue="Select Status"
              accessible={true}
              scrollViewAccessibilityLabel={'Scrollable options'}
              cancelButtonAccessibilityLabel={'Cancel Button'}
              onChange={option => setStatus(option.key)}>
              <TextInput
                style={styles.input}
                placeholder="Status"
                value={status}
                editable={false}
              />
            </ModalSelector>
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={descriptionText => setDescription(descriptionText)}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                editedTodo ? handleUpdateTodo() : handleAddTodo();
                setModalVisible(false);
              }}>
              <Text style={styles.buttonText}>
                {editedTodo ? 'Update Task' : 'Add Task'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, {backgroundColor: 'red'}]}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={viewModalVisible}
        onRequestClose={() => setViewModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedTask && (
              <View>
                <Text style={styles.taskDetailTitle}>Task Details</Text>
                <Text>Title: {selectedTask.title}</Text>
                <Text>Due Date: {selectedTask.dueDate}</Text>
                <Text>Priority: {selectedTask.priority}</Text>
                <Text>Category: {selectedTask.category}</Text>
                <Text>Status: {selectedTask.status}</Text>
                <Text>Description: {selectedTask.description}</Text>
                <Text></Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setViewModalVisible(false)}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 40,
  },
  input: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 6,
    paddingVertical: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  taskContainer: {
    backgroundColor: '#d3fa84',
    borderRadius: 6,
    paddingVertical: 12,
    paddingLeft: 8,
    paddingRight: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#201773',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '80%',
  },
  taskDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default TodoScreen;
