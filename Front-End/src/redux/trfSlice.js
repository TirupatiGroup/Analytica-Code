import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Fetching data based on vertical
export const fetchTrfData = createAsyncThunk(
  'trf/fetchTrfData',
  async (vertical, { rejectWithValue }) => {
    try {
      const response = await api.get(`/trfs/${vertical}`);
      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Deleting TRF data
export const deleteTrfData = createAsyncThunk(
  'trf/deleteTrfData',
  async ({ vertical, trfid }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/trfs/${vertical}/${trfid}`);
      if (response.status !== 200) {
        throw new Error('Failed to delete the record');
      }
      return { vertical, trfid };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const trfSlice = createSlice({
  name: 'trf',
  initialState: {
    data: [],
    loading: false,
    error: null,
    searchTerm: localStorage.getItem('searchTerm') || '',
    statusFilter: localStorage.getItem('statusFilter') || '',
    vertical: localStorage.getItem('vertical') || '',
    currentMonth: new Date(localStorage.getItem('currentMonth')) || new Date(),
  },
  reducers: {
    // Update search term in state
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
      localStorage.setItem('searchTerm', action.payload);
    },
    // Update status filter in state
    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
      localStorage.setItem('statusFilter', action.payload);
    },
    // Update vertical in state with validation
    setVertical(state, action) {
      const newVertical = action.payload;
      if (['nt', 'sp', 'ph', 'ay'].includes(newVertical)) {
        state.vertical = newVertical;
      } else {
        state.vertical = 'nt';
      }
      localStorage.setItem('vertical', state.vertical);
    },
    // Update current month and persist it
    setCurrentMonth(state, action) {
      state.currentMonth = action.payload;
      localStorage.setItem('currentMonth', action.payload.toISOString());
    },
    // Reset the state to initial values
    resetState(state) {
      state.data = [];
      state.loading = false;
      state.error = null;
      state.searchTerm = '';
      state.statusFilter = '';
      state.vertical = '';
      state.currentMonth = new Date();
      localStorage.clear();  // Optionally clear localStorage when resetting state
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrfData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrfData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchTrfData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTrfData.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTrfData.fulfilled, (state, action) => {
        const trfid = action.payload.trfid;
        state.data = state.data.filter(item => 
          !(item.arnnutra === trfid || item.arnayurveda === trfid || 
            item.arnpharma === trfid || item.arnsports === trfid)
        );
        state.loading = false;
      })
      .addCase(deleteTrfData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export the actions including resetState and setCurrentMonth
export const { setSearchTerm, setStatusFilter, setVertical, setCurrentMonth, resetState } = trfSlice.actions;

// Selectors for accessing state
export const selectTrfData = (state) => state.trf.data;
export const selectLoading = (state) => state.trf.loading;
export const selectError = (state) => state.trf.error;
export const selectSearchTerm = (state) => state.trf.searchTerm;
export const selectStatusFilter = (state) => state.trf.statusFilter;
export const selectVertical = (state) => state.trf.vertical;
export const selectCurrentMonth = (state) => state.trf.currentMonth;

export default trfSlice.reducer;
