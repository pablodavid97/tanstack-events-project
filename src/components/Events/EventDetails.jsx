import { useState } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchEvent } from '../../util/http.js';
import { deleteEvent } from '../../util/http.js';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../util/http.js';

import Header from '../Header.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
    const [isDeleting, setIsDeleting] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();
    const {
        data: event,
        isLoading,
        isError: errorFetching,
        error,
    } = useQuery({
        queryKey: ['events', { id }],
        queryFn: ({ signal }) => fetchEvent({ id, signal }),
    });

    const {
        mutate,
        isPending: pendingDeletion,
        isError: errorDeleting,
    } = useMutation({
        mutationFn: deleteEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['events'],
                refetchType: 'none',
            });
            navigate('/events');
        },
    });

    const handleStartDelete = () => {
        setIsDeleting(true);
    };

    const handleStopDelete = () => {
        setIsDeleting(false);
    };

    const handleDeleteEvent = () => {
        mutate({ id });
    };

    let loadingContent;
    let errorContent;

    if (isLoading) {
        loadingContent = (
            <section id='event-details-content' className='content-section'>
                <p style={{ textAlign: 'center' }}>
                    Loading data please wait...
                </p>
            </section>
        );
    }

    if (errorFetching) {
        errorContent = (
            <section className='content-section'>
                <ErrorBlock
                    title='An error occurred!'
                    message={error.info?.message || 'Failed to fetch event.'}
                />
            </section>
        );
    }

    return (
        <>
            {isDeleting && (
                <Modal onClose={handleStopDelete}>
                    <h2>Are you sure?</h2>
                    <p>
                        Do you really want to delete this event? This action
                        cannot be undone.
                    </p>
                    <div className='form-actions'>
                        {pendingDeletion && <p>Deleting, please wait...</p>}
                        {!pendingDeletion && (
                            <>
                                <button
                                    onClick={handleStopDelete}
                                    className='button-text'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteEvent}
                                    className='button'
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                    {errorDeleting && (
                        <ErrorBlock
                            title='Failed to delete event'
                            message={
                                errorDeleting.info?.message ||
                                'Failed to delete event, please try again later.'
                            }
                        />
                    )}
                </Modal>
            )}
            <Outlet />
            <Header>
                <Link to='/events' className='nav-item'>
                    View all Events
                </Link>
            </Header>
            {errorContent}
            {loadingContent}
            {!isLoading && !errorFetching && (
                <article id='event-details'>
                    <header>
                        <h1>{event.title}</h1>
                        <nav>
                            <button onClick={handleStartDelete}>Delete</button>
                            <Link to='edit'>Edit</Link>
                        </nav>
                    </header>
                    <div id='event-details-content'>
                        <img
                            src={`${import.meta.env.VITE_BACKEND_URL}/${
                                event.image
                            }`}
                            alt={event.title}
                        />
                        <div id='event-details-info'>
                            <div>
                                <p id='event-details-location'>
                                    {event.location}
                                </p>
                                <time dateTime={`Todo-DateT$Todo-Time`}>
                                    {event.date} {event.time}
                                </time>
                            </div>
                            <p id='event-details-description'>
                                {event.description}
                            </p>
                        </div>
                    </div>
                </article>
            )}
        </>
    );
}
